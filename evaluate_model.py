
from pathlib import Path

import torch
import torch.nn as nn
import matplotlib.pyplot as plt

from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, random_split

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)

# 1. Configuration
DATA_DIR = Path(r"F:\smart-waste-segregation\RealWaste")
MODEL_PATH = Path("models/best_model.pth")
OUTPUT_DIR = Path("evaluation_results")

OUTPUT_DIR.mkdir(exist_ok=True)

BATCH_SIZE = 16
SEED = 42

device = torch.device("cpu")
torch.manual_seed(SEED)

# 2. Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# 3. Load dataset
dataset = datasets.ImageFolder(
    root=str(DATA_DIR),
    transform=transform
)

classes = dataset.classes

print("Classes:", classes)
print("Total images:", len(dataset))

# 4. Recreate original validation split
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

generator = torch.Generator().manual_seed(SEED)

_, val_dataset = random_split(
    dataset,
    [train_size, val_size],
    generator=generator
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)

print("Validation images:", len(val_dataset))

# 5. Load trained model
checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True
)

classes = checkpoint["classes"]

model = models.resnet18(weights=None)
model.fc = nn.Linear(
    model.fc.in_features,
    len(classes)
)

model.load_state_dict(checkpoint["model_state_dict"])
model.to(device)
model.eval()

print("\nModel loaded successfully!")

# 6. Evaluate model
all_labels = []
all_predictions = []

with torch.inference_mode():

    for images, labels in val_loader:

        images = images.to(device)

        outputs = model(images)
        predictions = outputs.argmax(dim=1)

        all_labels.extend(labels.tolist())
        all_predictions.extend(predictions.cpu().tolist())

print("\nPrediction completed!")

# 7. Accuracy
accuracy = accuracy_score(
    all_labels,
    all_predictions
)

print(f"\nOverall Accuracy: {accuracy * 100:.2f}%")

# 8. Classification report
report = classification_report(
    all_labels,
    all_predictions,
    labels=list(range(len(classes))),
    target_names=classes,
    zero_division=0
)

print("\nClassification Report:\n")
print(report)

with open(
    OUTPUT_DIR / "classification_report.txt",
    "w",
    encoding="utf-8"
) as file:
    file.write(report)

# 9. Confusion matrix
cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=list(range(len(classes)))
)

fig, ax = plt.subplots(figsize=(12, 9))

image = ax.imshow(cm, cmap="Blues")
fig.colorbar(image, ax=ax)

ax.set(
    title="Waste Classification Confusion Matrix",
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

plt.show()

print("\nEvaluation completed!")
print("Results saved in:", OUTPUT_DIR)

# --------------------------------
# 10. Inspect misclassified samples
# --------------------------------

from collections import defaultdict

confused_pairs = defaultdict(list)

for i, (actual, predicted) in enumerate(
    zip(all_labels, all_predictions)
):
    if actual != predicted:

        original_index = val_dataset.indices[i]
        image_path, _ = dataset.samples[original_index]

        pair = (classes[actual], classes[predicted])
        confused_pairs[pair].append(image_path)

print("\nTOP MISCLASSIFICATION PAIRS")

sorted_pairs = sorted(
    confused_pairs.items(),
    key=lambda item: len(item[1]),
    reverse=True
)

for (actual, predicted), paths in sorted_pairs[:10]:

    print(
        f"\n{actual} -> {predicted}: {len(paths)} images"
    )

    for path in paths[:5]:
        print("  ", path)

# Save paths for further inspection
with open(
    OUTPUT_DIR / "misclassified_images.txt",
    "w",
    encoding="utf-8"
) as file:

    for (actual, predicted), paths in sorted_pairs:

        file.write(
            f"\n{actual} -> {predicted}: {len(paths)} images\n"
        )

        for path in paths:
            file.write(path + "\n")

print("\nMisclassified image paths saved!")
