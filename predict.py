
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models

# Paths
MODEL_PATH = Path("models/best_model.pth")
IMAGE_PATH = Path(r"F:\smart-waste-segregation\RealWaste\Metal\Metal_13.jpg")

# Check files
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

if not IMAGE_PATH.exists():
    raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

device = torch.device("cpu")

# Load checkpoint
checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=True
)

classes = checkpoint["classes"]

# Rebuild the same model architecture
model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(classes))
model.load_state_dict(checkpoint["model_state_dict"])
model.to(device)
model.eval()

# Same preprocessing used during training
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# Load image and predict
image = Image.open(IMAGE_PATH).convert("RGB")
input_tensor = transform(image).unsqueeze(0).to(device)

with torch.no_grad():
    outputs = model(input_tensor)
    probabilities = torch.softmax(outputs, dim=1)[0]

confidence, predicted_idx = probabilities.max(dim=0)

print("\n--- Waste Classification Result ---")
print("Predicted category:", classes[predicted_idx.item()])
print(f"Confidence: {confidence.item() * 100:.2f}%")

print("\nTop 3 predictions:")
top_probs, top_indices = torch.topk(
    probabilities, min(3, len(classes))
)

for prob, idx in zip(top_probs, top_indices):
    print(f"{classes[idx.item()]}: {prob.item() * 100:.2f}%")
