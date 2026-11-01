
import json
from pathlib import Path

import torch
import torch.nn as nn
import matplotlib.pyplot as plt

from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, Subset

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# =====================================
# 1. CONFIGURATION
# =====================================

DATA_DIR = Path(r"F:\smart-waste-segregation\RealWaste")
MODEL_PATH = Path("models/experiment1_best.pth")
SPLIT_PATH = Path("training_results/experiment1_splits.json")
OUTPUT_DIR = Path("evaluation_results/experiment1")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

BATCH_SIZE = 16
device = torch.device("cpu")

# =====================================
# 2. PREPROCESSING
# =====================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# =====================================
# 3. LOAD SAVED SPLIT
# =====================================

with open(SPLIT_PATH, "r", encoding="utf-8") as file:
    split_data = json.load(file)

test_indices = split_data["test_indices"]

dataset = datasets.ImageFolder(
    root=str(DATA_DIR),
    transform=transform
)

classes = dataset.classes

assert classes == split_data["classes"], (
    "Dataset class order does not match saved split!"
)

test_dataset = Subset(dataset, test_indices)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

print("Test images:", len(test_dataset))
print("Classes:", classes)

# =====================================
# 4. LOAD TRAINED MODEL
# =====================================

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True
)

assert classes == checkpoint["classes"]

model = models.resnet18(weights=None)

model.fc = nn.Linear(
    model.fc.in_features,
    len(classes)
)

model.load_state_dict(checkpoint["model_state_dict"])
model.to(device)
model.eval()

print("\nExperiment 1 model loaded!")

# =====================================
# 5. TEST EVALUATION
# =====================================

all_labels = []
all_predictions = []

with torch.inference_mode():

    for batch_index, (images, labels) in enumerate(test_loader):

        images = images.to(device)

        outputs = model(images)

        predictions = outputs.argmax(dim=1)

        all_labels.extend(labels.tolist())
        all_predictions.extend(predictions.cpu().tolist())

        if batch_index % 10 == 0:
            print(
                f"Processed "
                f"{len(all_labels)}/{len(test_dataset)} images",
                flush=True
            )

print("\nTest predictions completed!")

# =====================================
# 6. ACCURACY
# =====================================

accuracy = accuracy_score(
    all_labels,
    all_predictions
)

print(f"\nTEST ACCURACY: {accuracy * 100:.2f}%")

# =====================================
# 7. CLASSIFICATION REPORT
# =====================================

report = classification_report(
    all_labels,
    all_predictions,
    labels=list(range(len(classes))),
    target_names=classes,
    zero_division=0
)

print("\nCLASSIFICATION REPORT:\n")
print(report)

with open(
    OUTPUT_DIR / "classification_report.txt",
    "w",
    encoding="utf-8"
) as file:
    file.write(report)

# =====================================
# 8. CONFUSION MATRIX
# =====================================

cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=list(range(len(classes)))
)

fig, ax = plt.subplots(figsize=(12, 9))

image = ax.imshow(cm, cmap="Blues")
fig.colorbar(image, ax=ax)

ax.set(
    title="Experiment 1 - Test Confusion Matrix",
    xlabel="Predicted Class",
    ylabel="Actual Class",
    xticks=range(len(classes)),
    yticks=range(len(classes)),
    xticklabels=classes,
    yticklabels=classes
)

plt.setp(
    ax.get_xticklabels(),
    rotation=45,
    ha="right"
)

threshold = cm.max() / 2

for i in range(len(classes)):
    for j in range(len(classes)):
        ax.text(
            j,
            i,
            str(cm[i, j]),
            ha="center",
            va="center",
            color="white" if cm[i, j] > threshold else "black"
        )

fig.tight_layout()

plt.savefig(
    OUTPUT_DIR / "confusion_matrix.png",
    dpi=300,
    bbox_inches="tight"
)

plt.close()

# =====================================
# 9. SAVE SUMMARY
# =====================================

summary = {
    "experiment": "Experiment 1 - Data Augmentation",
    "test_images": len(test_dataset),
    "test_accuracy": round(accuracy * 100, 2),
    "validation_accuracy": checkpoint["val_accuracy"],
    "best_epoch": checkpoint["best_epoch"],
    "classes": classes
}

with open(
    OUTPUT_DIR / "summary.json",
    "w",
    encoding="utf-8"
) as file:
    json.dump(summary, file, indent=4)

print("\n================================")
print("EXPERIMENT 1 TEST EVALUATION DONE")
print("================================")
print("Test accuracy:", round(accuracy * 100, 2), "%")
print("Results saved at:", OUTPUT_DIR)
