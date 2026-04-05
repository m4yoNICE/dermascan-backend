import cv2
import numpy as np
import sys
import json

MAX_IMAGE_SIZE_MB = 10
MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

try:
    # Step 1: Read image bytes safely
    image_data = sys.stdin.buffer.read(MAX_IMAGE_BYTES + 1)

    if not image_data:
        raise ValueError("No input received")

    if len(image_data) > MAX_IMAGE_BYTES:
        raise ValueError(f"Image exceeds {MAX_IMAGE_SIZE_MB}MB limit")

    # Step 2: Decode using OpenCV
    nparr = np.frombuffer(image_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image format or unreadable bytes")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Step 3: Exposure Check
    mean_intensity = float(gray.mean())

    if mean_intensity < 20:
        print(json.dumps({
            "ok": False,
            "reason": "too_dark",
            "brightness": mean_intensity
        }))
        sys.exit(1)

    if mean_intensity > 240:
        print(json.dumps({
            "ok": False,
            "reason": "too_bright",
            "brightness": mean_intensity
        }))
        sys.exit(1)

    # Step 4: Blur Check (Laplacian variance)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    variance = float(lap.var())

    BLUR_THRESHOLD = 0.04  # adjust after testing real images

    if variance < BLUR_THRESHOLD:
        print(json.dumps({
            "ok": False,
            "reason": "too_blurry",
            "variance": variance,
            "brightness": mean_intensity
        }))
        sys.exit(1)

    # Step 5: Success
    h, w = gray.shape

    print(json.dumps({
        "ok": True,
        "variance": variance,
        "brightness": mean_intensity,
        "resolution": {"width": w, "height": h}
    }))

    sys.exit(0)

except Exception as e:
    print(json.dumps({"ok": False, "error": str(e)}))
    sys.exit(1)
