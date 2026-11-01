
from pathlib import Path
import re

import matplotlib.pyplot as plt
from PIL import Image

# Configuration
RESULT_FILE = Path("evaluation_results/misclassified_images.txt")
OUTPUT_DIR = Path("evaluation_results")
OUTPUT_DIR.mkdir(exist_ok=True)

TARGET_PAIRS = [
    ("Metal", "Plastic"),
    ("Miscellaneous Trash", "Plastic"),
    ("Miscellaneous Trash", "Vegetation"),
]

images_to_show = []

# Read misclassified image paths
current_pair = None

with open(RESULT_FILE, "r", encoding="utf-8") as file:

    for line in file:

        line = line.strip()

        match = re.match(r"(.+) -> (.+): \d+ images", line)

        if match:
            current_pair = (match.group(1), match.group(2))
            continue

        if current_pair in TARGET_PAIRS and line:
            images_to_show.append((current_pair, line))

# Select first five images from each pair
selected = []

for pair in TARGET_PAIRS:

    pair_images = [
        item for item in images_to_show
        if item[0] == pair
    ]

    selected.extend(pair_images[:5])

# Generate contact sheet
fig, axes = plt.subplots(
    3, 5,
    figsize=(18, 11)
)

for ax, (pair, image_path) in zip(
    axes.flatten(), selected
):

    try:
        img = Image.open(image_path).convert("RGB")

        ax.imshow(img)
        ax.set_title(
            f"Actual: {pair[0]}\nPredicted: {pair[1]}",
            fontsize=9
        )

    except Exception as error:
        ax.set_title(f"Error: {error}")

    ax.axis("off")

fig.suptitle(
    "ResNet18 - Misclassified Waste Images",
    fontsize=16
)

plt.tight_layout()

output_path = OUTPUT_DIR / "misclassified_contact_sheet.png"

plt.savefig(
    output_path,
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print("Contact sheet saved:", output_path)
print("Images selected:", len(selected))
