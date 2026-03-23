import json

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import yolo
from .geo import detection_to_gps

# import the projection class projection.py
from .projection import GroundProjection


# setting up struct for drone data
class AircraftTelemetry(BaseModel):
    altitude: float
    lat: float
    lng: float
    yaw: float


app = FastAPI()

# defining allowed origins
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # vite react
]

# adding CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

    # get image dimensions
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    image_height, image_width, _ = img.shape
    cv2.imwrite("saved_image.jpg", img)

    # yolo
    detections = yolo.detect(image_bytes)
    gps_detections = [
        detection_to_gps(
            d, image_width, image_height, data.lat, data.lng, ground_projection
        )
        for d in detections
    ]

    print(f"Detections: {gps_detections}")
    # save image_bytes into a file or database
    # with open("saved_image.jpg", "wb") as f:
    #     f.write(image_bytes)

    # save telemetry data
    global latest_telemetry
    latest_telemetry = {
        "telemetry": data,
        "projection": ground_projection,
        "detections": gps_detections,
    }

    # returning just the telemetry data like the original Rust code
    # return HttpResponse::Ok().json(data);
    return {
        "telemetry": data,
        "projection": ground_projection,
        "detections": gps_detections,
    }
