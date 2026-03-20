import json

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from . import yolo

# import the projection class projection.py
from .projection import GroundProjection


# setting up struct for drone data
class AircraftTelemetry(BaseModel):
    altitude: float
    lat: float
    lng: float
    yaw: float


app = FastAPI()


@app.get("/")
async def hello_world():
    return "Hello World!"


# post implementation
@app.post("/telemetry")
async def rec_telemetry(
    # FastAPI handles the multipart form parsing automatically here
    metadata: str = Form(...),
    image: UploadFile = File(...),
):
    # check if telemetry is received and valid prior to processing
    try:
        telemetry_dict = json.loads(metadata)
        data = AircraftTelemetry(**telemetry_dict)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="missing or invalid metadata field in multipart response",
        )

    print(f"Telemetry received: {data}")

    # initialize and calculate ground projection
    ground_projection = GroundProjection(
        distance_from_ground=data.altitude, yaw=data.yaw
    )
    ground_projection.calculate()
    print(f"Ground projection: {ground_projection}")

    # collect binary bytes for the image
    image_bytes = await image.read()
    detections = yolo.detect(image_bytes)
    print(f"Detections: {detections}")
    # save image_bytes into a file or database
    # with open("saved_image.jpg", "wb") as f:
    #     f.write(image_bytes)

    # returning just the telemetry data like the original Rust code
    # return HttpResponse::Ok().json(data);
    return {
        "telemetry": data,
        "projection": ground_projection,
        "detections": detections,
    }
