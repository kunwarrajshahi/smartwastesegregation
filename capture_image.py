
import cv2
from pathlib import Path

# Create a folder to save captured images
output_dir = Path("captured_images")
output_dir.mkdir(exist_ok=True)

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    raise SystemExit

print("Press 's' to save an image, 'q' to quit.")

while True:
    ret, frame = cap.read()

    if not ret:
        print("Error: Could not capture frame.")
        break

    cv2.imshow("Waste Image Capture", frame)
    key = cv2.waitKey(1) & 0xFF

    if key == ord("s"):
        image_path = output_dir / "waste_sample.jpg"
        saved = cv2.imwrite(str(image_path), frame)

        if saved:
            print(f"Image saved: {image_path.resolve()}")

    elif key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
