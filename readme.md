# PyVultures

A FastAPI server that recieves drone telemetry and images, calculates the ground projection of the camera footprint, runs YOLO object detection, and maps the detected objects to real world GPS coordinates. This is then sent to a simple react frontend, displaying the map points with leaflet.

Not included in this repo is the required DJI Mobile app built with the DJI Android APK. I am not very familiar with android development, and frankly I had a hard time with the DJI docs. For these reasons I modified one of the DJI SDK example applications. 

To ensure that this code works with your drone telemetry and images, you must ensure that the camera on the drone is facing directly down as the ground projection is calculated assuming the camera is parallel with the ground. This might be changed in the future, but is most simple to ensure that the drone application only sends telemetry to the server when the camera is facing downwards.

## Installation

Make sure you have a Python virtual environment set up, then install the required dependencies:

```bash
pip install fastapi uvicorn python-multipart opencv-python numpy ultralytics pydantic
```

## Running the App

Start the development server using `uvicorn`:

```bash
python -m uvicorn app.main:app --reload
```

The server will start running on `http://127.0.0.1:8000`.

## Testing the API

The easiest way to test the API is by using FastAPI's built-in interactive documentation.

1. Open your browser and go to http://127.0.0.1:8000/docs
2. Open the `POST /telemetry` route and click **"Try it out"**.
3. In the `metadata` field, paste a sample JSON string representing the drone's telemetry. For example:
   ```json
   {"altitude": 120.5, "lat": 34.05, "lng": -118.24, "yaw": 45.0}
   ```
4. In the `image` field, choose any image (`.jpg` or `.png`) from your computer.
5. Click **"Execute"**.

Alternatively, you can test it from the terminal using `curl`:

```bash
curl -X POST http://127.0.0.1:8000/telemetry \
  -F 'metadata={"altitude": 120.5, "lat": 34.05, "lng": -118.24, "yaw": 45.0}' \
  -F "image=@/path/to/your/image.jpg"
```
