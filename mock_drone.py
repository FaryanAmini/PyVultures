import json
import random
import time
import urllib.request

# Center of operations (matches default in frontend)
BASE_LAT = 42.3555
BASE_LNG = -71.0565

CLASSES = ["person", "car", "bicycle", "motorcycle"]

# Initialize some fake targets
targets = []
for _ in range(20):
    targets.append(
        {
            "id": random.randint(1000, 9999),
            "lat": BASE_LAT + random.uniform(-0.0001, 0.0001),
            "lng": BASE_LNG + random.uniform(-0.0001, 0.0001),
            "dlat": random.uniform(-0.00001, 0.00001),
            "dlng": random.uniform(-0.00001, 0.00001),
            "class_name": random.choice(CLASSES),
            "confidence": random.uniform(0.6, 0.99),
        }
    )


def send_mock_data():
    print("Starting mock drone simulation... Press Ctrl+C to stop.")

    while True:
        detections = []

        for t in targets:
            # Move target slightly
            t["lat"] += t["dlat"]
            t["lng"] += t["dlng"]

            # Occasionally change direction
            if random.random() < 0.1:
                t["dlat"] = random.uniform(-0.0001, 0.0001)
                t["dlng"] = random.uniform(-0.0001, 0.0001)

            # Keep them somewhat within bounds
            if abs(t["lat"] - BASE_LAT) > 0.0002:
                t["dlat"] *= -1
            if abs(t["lng"] - BASE_LNG) > 0.0002:
                t["dlng"] *= -1

            detections.append(
                {
                    "gps": {"lat": t["lat"], "lng": t["lng"]},
                    "class_name": t["class_name"],
                    "confidence": t["confidence"],
                }
            )

        payload = {
            "telemetry": {
                "altitude": 100.0,
                "lat": BASE_LAT,
                "lng": BASE_LNG,
                "yaw": 0.0,
            },
            "projection": None,
            "detections": detections,
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            "http://localhost:8000/mock_detections",
            data=data,
            headers={"Content-Type": "application/json"},
        )

        try:
            urllib.request.urlopen(req)
            print(f"Sent {len(detections)} mock detections.")
        except Exception as e:
            print(f"Failed to send data (is the backend running?): {e}")

        time.sleep(1)


if __name__ == "__main__":
    try:
        send_mock_data()
    except KeyboardInterrupt:
        print("\nSimulation stopped.")
