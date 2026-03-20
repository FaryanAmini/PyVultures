import numpy as np
from ultralytics import YOLO  # type: ignore

# load model
print("loading YOLO model...")
model = YOLO("yolo11n.pt")
print("model loaded")


def detect(image_bytes: bytes) -> list:
    """take in raw image bytes and run yolo detections. each detection outputs as dict with class_name, confidence, and box"""

    # convert bytes to np array for yolo
    np_arr = np.frombuffer(image_bytes, np.uint8)
    results = model(np_arr)

    # parse retults into dicts
    detections = []
    for result in results:
        for box in result.boxes:
            detections.append(
                {
                    "class_name": result.names[int(box.cls)],
                    "confidence": round(float(box.conf), 4),
                    "box": {
                        "x1": int(box.xyxy[0][0]),
                        "y1": int(box.xyxy[0][1]),
                        "x2": int(box.xyxy[0][2]),
                        "y2": int(box.xyxy[0][3]),
                    },
                }
            )

    return detections
