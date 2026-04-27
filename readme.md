# PyVultures

A monorepo for strategic drone surveillance and reconnaissance. 

This platform consists of a FastAPI backend that processes live drone telemetry and video, runs YOLO object detection, and maps detections to real-world GPS coordinates. This data is then visualized on a tactical React dashboard featuring both 2D mapping and 3D environment synthesis.

## Core Features

- **Live Recon Mode:** Real-time target identification (People, Vehicles, etc.) with automated GPS coordinate calculation and mapping.
- **Tactical Visualization:** A customized Leaflet dashboard with color-coded markers and a "Pattern of Life" heatmap mode to track high-activity areas.
- **3D Scanner:** A dedicated mode to capture datasets from the drone and synthesize them into volumetric 3D models using Depth-Anything-3.
- **Session Management:** Automatically organizes captures into unique session folders, allowing you to reprocess historical data into 3D scans.
- **GLB Viewer:** A built-in 3D viewport using React Three Fiber to inspect recon scans without leaving the dashboard.

## Technical Structure

The project is structured as a monorepo to isolate the heavy 3D processing from the lightweight live API:

- `app/`: The FastAPI backend handling live telemetry, YOLO inference, and geospatial math.
- `frontend/`: The React/Vite tactical dashboard.
- `3DRecon/`: A specialized engine for 3D reconstruction (Depth-Anything-3) with its own isolated environment to prevent dependency conflicts.
- `captured_scans/`: The storage directory where drone frames are organized into missions/sessions.

## Important Note on Drone Setup

Not included in this repo is the required DJI Mobile app built with the DJI Android SDK. I modified one of the DJI SDK sample applications to stream frames and telemetry to this server.

To ensure the geospatial math is accurate, the drone camera should be looking straight down (Nadir view), as the ground projection logic currently assumes the camera plane is parallel to the earth.

## Getting Started

### 1. Backend (FastAPI)
Set up a Python virtual environment and install the required packages:
```bash
pip install fastapi uvicorn python-multipart opencv-python numpy ultralytics pydantic
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: Using `--host 0.0.0.0` is required for the Android app to connect to your machine.*

### 2. Frontend (React / Vite)
Navigate to the frontend folder and install dependencies:
```bash
cd frontend
npm install
npm run dev
```

### 3. 3D Engine (3DRecon)
Ensure your `3DRecon` folder has its own virtual environment with the necessary PyTorch and CUDA drivers installed to handle the Depth-Anything-3 inference.

## What is to Come

The next major step is the "Holy Grail" of this project: **Cross-Dimensional Synchronization.** 

We are working on bridging the live YOLO detections directly into the 3D scans. This will allow an operator to see a live 3D "God-View" where targets detected by the drone are plotted as glowing markers inside the 3D model in real-time. 

We live in an era where privacy no longer exists. Where everything is being watched. Maybe this is me reclaiming it. By building these tools ourselves, we take the "eyes in the sky" out of the hands of the few and put them into the hands of the many.