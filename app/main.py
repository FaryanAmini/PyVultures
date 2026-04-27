import json
import os
import shutil
import subprocess
from datetime import datetime

import cv2
import numpy as np
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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

LATEST_TELEMETRY = {
    "telemetry": None,
    "projection": None,
    "detections": [],
}


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
    global LATEST_TELEMETRY
    LATEST_TELEMETRY = {
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


@app.get("/feed")
async def get_live_feed():
    if os.path.exists("saved_image.jpg"):
        return FileResponse(
            "saved_image.jpg",
            media_type="image/jpeg",
            headers={"Cache-Control": "no-cache"},
        )
    raise HTTPException(status_code=404, detail="No feed available")


@app.get("/detections")
async def send_telemetry():
    return LATEST_TELEMETRY


# create a capture directory if one does not exist

BASE_CAPTURE_DIR = "captured_scans"
CURRENT_SESSION_DIR = None


def get_current_session_dir():
    global CURRENT_SESSION_DIR
    if CURRENT_SESSION_DIR is None:
        # create new sesion id when the server boots
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        CURRENT_SESSION_DIR = os.path.join(BASE_CAPTURE_DIR, session_id)
        os.makedirs(CURRENT_SESSION_DIR, exist_ok=True)
    return CURRENT_SESSION_DIR


@app.post("/session/new")
async def new_session():
    """creates a new folder for capturing scans and 3d model data base on the session"""
    global CURRENT_SESSION_DIR
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    CURRENT_SESSION_DIR = os.path.join(BASE_CAPTURE_DIR, session_id)
    os.makedirs(CURRENT_SESSION_DIR, exist_ok=True)
    return {"status": "success", "session": session_id}


@app.post("/capture")
async def capture_frame():
    """takes the most recent frame and saves it to a dataset"""
    # check if the server has recieved an image
    if not os.path.exists("saved_image.jpg"):
        raise HTTPException(status_code=400, detail="no image received from drone")

    session_dir = get_current_session_dir()

    # generate a unique filename for the capture based on the time
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    new_filename = os.path.join(session_dir, f"frame_{timestamp}.jpg")

    # copy the lateste image into the capture folder
    shutil.copy2("saved_image.jpg", new_filename)

    return {"status": "success", "filename": new_filename, "session": session_dir}


@app.get("/sessions")
async def list_sessions():
    if not os.path.exists(BASE_CAPTURE_DIR):
        return {"sessions": []}
    sessions = []
    for d in os.listdir(BASE_CAPTURE_DIR):
        full_path = os.path.join(BASE_CAPTURE_DIR, d)
        if os.path.isdir(full_path) and d.startswith("session_"):
            images = [
                f for f in os.listdir(full_path) if f.endswith((".jpg", ".png", ".JPG"))
            ]
            sessions.append({"id": d, "image_count": len(images)})
    sessions.sort(key=lambda x: x["id"], reverse=True)
    return {"sessions": sessions}


# create dict to store session generation status
GENERATION_STATUS = {}


# check generation status for the 3d reconstruction
@app.get("/generate/status/{session_id}")
async def get_generation_status(session_id: str):
    status = GENERATION_STATUS.get(session_id, "idle")
    return {"session_id": session_id, "status": status}


@app.post("/generate")
async def start_generation(background_tasks: BackgroundTasks, session_id: str = None):
    if session_id:
        input_folder = os.path.join(BASE_CAPTURE_DIR, session_id)
    else:
        input_folder = get_current_session_dir()
        session_id = os.path.basename(input_folder)

    if not os.path.exists(input_folder):
        raise HTTPException(status_code=404, detail="Session folder not found")
    # check the output directory exists so the frontend can use it
    output_folder = os.path.join("frontend", "public", "generated_models")
    os.makedirs(output_folder, exist_ok=True)

    # define the command
    cmd = [
        "3DRecon/.venv/bin/python",
        "3DRecon/main.py",
        "--input",
        input_folder,
        "--output",
        output_folder,
    ]

    # run the subprocess
    def run_reconstruction():
        try:
            GENERATION_STATUS[session_id] = "running"
            print("Starting 3D reconstruction...")
            subprocess.run(cmd, check=True)
            print("3D reconstruction finished successfully.")

            import glob
            import shutil

            glb_files = glob.glob(
                os.path.join(output_folder, "**/*.glb"), recursive=True
            )
            if glb_files:
                latest_file = max(glb_files, key=os.path.getctime)
                shutil.copy2(
                    latest_file, os.path.join("frontend", "public", "latest.glb")
                )
                print(f"Copied {latest_file} to latest.glb")
                GENERATION_STATUS[session_id] = "completed"

        except subprocess.CalledProcessError as e:
            print(f"3D reconstruction failed with error: {e}")
            GENERATION_STATUS[session_id] = "failed"

    # add the task to run in the background
    background_tasks.add_task(run_reconstruction)

    return {
        "status": "started",
        "session_id": session_id,
        "message": "3D Processing running in background",
    }
