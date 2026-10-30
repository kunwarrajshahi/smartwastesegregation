
from pathlib import Path

# CHANGE THIS to the folder path containing the 9 category folders
dataset_path = Path(r"F:\smart-waste-segregation\RealWaste")

valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

if not dataset_path.exists():
    print("Dataset path does not exist. Please check the path.")
else:
    total_images = 0

    for folder in sorted(dataset_path.iterdir()):
        if folder.is_dir():
            count = sum(
                1 for file in folder.rglob("*")
                if file.is_file() and file.suffix.lower() in valid_extensions
            )
            total_images += count
            print(f"{folder.name}: {count} images")

    print("-" * 35)
    print(f"Total images: {total_images}")
