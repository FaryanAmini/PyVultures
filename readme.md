# PyVultures

A FastAPI server that receives drone telemetry and images, calculates the ground projection of the camera footprint, runs YOLO object detection, and maps the detected objects to real world GPS coordinates. This is then sent to a simple react frontend, displaying the map points with leaflet.

Not included in this repo is the required DJI Mobile app built with the DJI Android APK. I am not very familiar with android development, and frankly I had a hard time with the DJI docs. For these reasons I modified one of the DJI SDK example applications. 

To ensure that this code works with your drone telemetry and images, you must ensure that the camera on the drone is facing directly down as the ground projection is calculated assuming the camera is parallel with the ground. This might be changed in the future, but is most simple to ensure that the drone application only sends telemetry to the server when the camera is facing downwards.

## Setup & Installation

To get everything running, you need to start both the Python backend and the React frontend. It's best to run these in two separate terminal windows.

### 1. Backend (FastAPI)

Make sure you have a Python virtual environment set up, then install the required dependencies:

```bash
pip install fastapi uvicorn python-multipart opencv-python numpy ultralytics pydantic
```

Start the development server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The server will start running on `http://127.0.0.1:8000`.

### 2. Frontend (React / Vite)

Make sure you have Node.js installed, then navigate to the frontend folder and install the dependencies:

```bash
cd frontend
npm install
```

Start the web dashboard:

```bash
npm run dev
```
The map dashboard will be available at `http://localhost:5173`. It will automatically poll the backend and update the map whenever new detections come in.

## Testing the API

The easiest way to test the API without flying the drone is by using FastAPI's built-in interactive documentation.

1. Open your browser and go to http://127.0.0.1:8000/docs
2. Open the `POST /telemetry` route and click **"Try it out"**.
3. In the `metadata` field, paste a sample JSON string representing the drone's telemetry. For example:
   ```json
   {"altitude": 120.5, "lat": 34.05, "lng": -118.24, "yaw": 45.0}
   ```
4. In the `image` field, choose any image (`.jpg` or `.png`) from your computer.
5. Click **"Execute"**.
6. Check your React dashboard—you should see the map move to the new coordinates and plot the detections!

Alternatively, you can test it from the terminal using `curl`:

```bash
curl -X POST http://127.0.0.1:8000/telemetry \
  -F 'metadata={"altitude": 120.5, "lat": 34.05, "lng": -118.24, "yaw": 45.0}' \
  -F "image=@/path/to/your/image.jpg"
```
