
import random
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models

# -----------------------------
# 1. Configuration
# -----------------------------
DATA_DIR = Path(r"F:\smart-waste-segregation\RealWaste")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

BATCH_SIZE = 16
EPOCHS = 5
LEARNING_RATE = 0.001
SEED = 42

random.seed(SEED)
torch.manual_seed(SEED)

device = torch.device("cpu")
print("Using device:", device)

# -----------------------------
# 2. Image preprocessing
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# -----------------------------
# 3. Load dataset
# -----------------------------
if not DATA_DIR.exists():
    raise FileNotFoundError(f"Dataset not found: {DATA_DIR}")

dataset = datasets.ImageFolder(
    root=str(DATA_DIR),
    transform=transform
)

if len(dataset.classes) != 9:
    raise ValueError(
        f"Expected 9 category folders, found {len(dataset.classes)}: "
        f"{dataset.classes}"
    )

print("Categories:", dataset.classes)
print("Total images:", len(dataset))

# 80% training, 20% validation
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

generator = torch.Generator().manual_seed(SEED)
train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size],
    generator=generator
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

print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))

# -----------------------------
# 4. Load pretrained ResNet18
# -----------------------------
weights = models.ResNet18_Weights.DEFAULT
model = models.resnet18(weights=weights)

# Replace final layer for 9 waste classes
model.fc = nn.Linear(model.fc.in_features, len(dataset.classes))
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)

# -----------------------------
# 5. Training and validation
# -----------------------------
best_val_accuracy = 0.0

for epoch in range(EPOCHS):
    model.train()
    train_loss = 0.0
    train_correct = 0
    train_total = 0

    for images, labels in train_loader:
        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        train_loss += loss.item() * images.size(0)
        predictions = outputs.argmax(dim=1)
        train_correct += (predictions == labels).sum().item()
        train_total += labels.size(0)

    train_loss /= train_total
    train_accuracy = 100 * train_correct / train_total

    model.eval()
    val_correct = 0
    val_total = 0
    val_loss = 0.0

    with torch.no_grad():
        for images, labels in val_loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            val_loss += loss.item() * images.size(0)
            predictions = outputs.argmax(dim=1)
            val_correct += (predictions == labels).sum().item()
            val_total += labels.size(0)

    val_loss /= val_total
    val_accuracy = 100 * val_correct / val_total

    print(f"\nEpoch [{epoch + 1}/{EPOCHS}]")
    print(f"Train Loss: {train_loss:.4f}")
    print(f"Train Accuracy: {train_accuracy:.2f}%")
    print(f"Validation Loss: {val_loss:.4f}")
    print(f"Validation Accuracy: {val_accuracy:.2f}%")

    if val_accuracy > best_val_accuracy:
        best_val_accuracy = val_accuracy

        torch.save({
            "model_state_dict": model.state_dict(),
            "classes": dataset.classes,
            "val_accuracy": val_accuracy
        }, MODEL_DIR / "best_model.pth")

        print("Best model saved!")

print("\nTraining completed!")
print(f"Best validation accuracy: {best_val_accuracy:.2f}%")
print("Model path: models/best_model.pth")
