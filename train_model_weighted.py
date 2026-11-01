
import json
import random
from pathlib import Path

import torch
import torch.nn as nn

from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms, models


# ==========================================
# 1. CONFIGURATION
# ==========================================

DATA_DIR = Path(r"F:\smart-waste-segregation\RealWaste")

MODEL_DIR = Path("models")
OUTPUT_DIR = Path("training_results")

MODEL_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "experiment2_weighted_best.pth"
SPLIT_PATH = OUTPUT_DIR / "experiment2_splits.json"
HISTORY_PATH = OUTPUT_DIR / "experiment2_history.json"

BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 0.0001
WEIGHT_DECAY = 0.0001

SEED = 42
PATIENCE = 4

device = torch.device("cpu")

random.seed(SEED)
torch.manual_seed(SEED)

print("Using device:", device)


# ==========================================
# 2. DATA TRANSFORMS
# ==========================================

train_transform = transforms.Compose([
    transforms.RandomResizedCrop(
        224,
        scale=(0.80, 1.0)
    ),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15,
        saturation=0.15,
        hue=0.03
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ==========================================
# 3. LOAD DATASET
# ==========================================

if not DATA_DIR.exists():
    raise FileNotFoundError(
        f"Dataset not found: {DATA_DIR}"
    )

base_dataset = datasets.ImageFolder(
    root=str(DATA_DIR)
)

classes = base_dataset.classes
labels = base_dataset.targets

if len(classes) != 9:
    raise ValueError(
        f"Expected 9 classes, found {len(classes)}"
    )

print("\nClasses:", classes)
print("Total images:", len(base_dataset))


# ==========================================
# 4. STRATIFIED SPLIT
# ==========================================

all_indices = list(range(len(base_dataset)))

train_indices, temp_indices = train_test_split(
    all_indices,
    test_size=0.30,
    random_state=SEED,
    stratify=labels
)

temp_labels = [
    labels[index] for index in temp_indices
]

val_indices, test_indices = train_test_split(
    temp_indices,
    test_size=0.50,
    random_state=SEED,
    stratify=temp_labels
)

# Verify no overlap
assert set(train_indices).isdisjoint(val_indices)
assert set(train_indices).isdisjoint(test_indices)
assert set(val_indices).isdisjoint(test_indices)

# Save split for reproducibility
with open(SPLIT_PATH, "w", encoding="utf-8") as file:
    json.dump({
        "seed": SEED,
        "classes": classes,
        "train_indices": train_indices,
        "val_indices": val_indices,
        "test_indices": test_indices
    }, file, indent=4)

print("\nTraining:", len(train_indices))
print("Validation:", len(val_indices))
print("Testing:", len(test_indices))


# ==========================================
# 5. CREATE DATASETS
# ==========================================

train_full_dataset = datasets.ImageFolder(
    root=str(DATA_DIR),
    transform=train_transform
)

eval_full_dataset = datasets.ImageFolder(
    root=str(DATA_DIR),
    transform=eval_transform
)

assert train_full_dataset.class_to_idx == eval_full_dataset.class_to_idx

train_dataset = Subset(
    train_full_dataset,
    train_indices
)

val_dataset = Subset(
    eval_full_dataset,
    val_indices
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# ==========================================
# 6. CALCULATE CLASS WEIGHTS
# ==========================================

# Count training samples for each class
class_counts = torch.bincount(
    torch.tensor(
        [labels[index] for index in train_indices]
    ),
    minlength=len(classes)
).float()

# Inverse-frequency weighting, normalized
class_weights = len(train_indices) / (
    len(classes) * class_counts
)

class_weights = class_weights / class_weights.mean()

class_weights = class_weights.to(device)

print("\nClass distribution and weights:")

for class_name, count, weight in zip(
    classes,
    class_counts.tolist(),
    class_weights.tolist()
):
    print(
        f"{class_name}: "
        f"count={int(count)}, weight={weight:.3f}"
    )


# ==========================================
# 7. LOAD RESNET18
# ==========================================

weights = models.ResNet18_Weights.DEFAULT

model = models.resnet18(weights=weights)

model.fc = nn.Linear(
    model.fc.in_features,
    len(classes)
)

model = model.to(device)

# Only change from Experiment 1:
# weighted CrossEntropyLoss
criterion = nn.CrossEntropyLoss(
    weight=class_weights
)

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2
)


# ==========================================
# 8. TRAINING
# ==========================================

best_val_accuracy = 0.0
best_epoch = 0
epochs_without_improvement = 0

history = []

for epoch in range(EPOCHS):

    model.train()

    train_loss = 0.0
    train_correct = 0
    train_total = 0

    for images, targets in train_loader:

        images = images.to(device)
        targets = targets.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, targets)

        loss.backward()
        optimizer.step()

        train_loss += loss.item() * images.size(0)

        predictions = outputs.argmax(dim=1)

        train_correct += (
            predictions == targets
        ).sum().item()

        train_total += targets.size(0)

    train_loss /= train_total

    train_accuracy = (
        100 * train_correct / train_total
    )

    # --------------------------
    # Validation
    # --------------------------

    model.eval()

    val_loss = 0.0
    val_correct = 0
    val_total = 0

    with torch.inference_mode():

        for images, targets in val_loader:

            images = images.to(device)
            targets = targets.to(device)

            outputs = model(images)

            loss = criterion(outputs, targets)

            val_loss += loss.item() * images.size(0)

            predictions = outputs.argmax(dim=1)

            val_correct += (
                predictions == targets
            ).sum().item()

            val_total += targets.size(0)

    val_loss /= val_total

    val_accuracy = (
        100 * val_correct / val_total
    )

    scheduler.step(val_accuracy)

    current_lr = optimizer.param_groups[0]["lr"]

    print(f"\nEpoch [{epoch + 1}/{EPOCHS}]")
    print(f"Train Loss: {train_loss:.4f}")
    print(f"Train Accuracy: {train_accuracy:.2f}%")
    print(f"Validation Loss: {val_loss:.4f}")
    print(f"Validation Accuracy: {val_accuracy:.2f}%")
    print(f"Learning Rate: {current_lr:.6f}")

    history.append({
        "epoch": epoch + 1,
        "train_loss": train_loss,
        "train_accuracy": train_accuracy,
        "val_loss": val_loss,
        "val_accuracy": val_accuracy,
        "learning_rate": current_lr
    })

    # Save best model
    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy
        best_epoch = epoch + 1

        torch.save({
            "model_state_dict": model.state_dict(),
            "classes": classes,
            "class_to_idx": train_full_dataset.class_to_idx,
            "class_weights": class_weights.cpu(),
            "val_accuracy": val_accuracy,
            "best_epoch": best_epoch,
            "experiment": "Experiment 2 - Class Weighted Loss"
        }, MODEL_PATH)

        print("Best weighted model saved!")

        epochs_without_improvement = 0

    else:
        epochs_without_improvement += 1

    if epochs_without_improvement >= PATIENCE:
        print("\nEarly stopping triggered.")
        break


# ==========================================
# 9. SAVE HISTORY
# ==========================================

with open(
    HISTORY_PATH,
    "w",
    encoding="utf-8"
) as file:
    json.dump(history, file, indent=4)


# ==========================================
# 10. SUMMARY
# ==========================================

print("\n================================")
print("EXPERIMENT 2 COMPLETED")
print("================================")

print("Best Epoch:", best_epoch)

print(
    f"Best Validation Accuracy: "
    f"{best_val_accuracy:.2f}%"
)

print("Model:", MODEL_PATH)
print("Split:", SPLIT_PATH)
print("History:", HISTORY_PATH)

print("\nTest set has NOT been evaluated.")
