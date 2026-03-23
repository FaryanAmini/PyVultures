import { useState, useEffect } from "react";
import VultureMap from "./components/VultureMap";
import "./App.css";

function App() {
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    // TODO: In the future, fetch from your FastAPI backend here.
    // fetch('http://localhost:8000/detections')
    //   .then(res => res.json())
    //   .then(data => setDetections(data));

    // For now, using mock data mimicking your YOLO gps_detections output
    const mockDetections = [
      { lat: 35.0123, lng: -120.0012, confidence: 0.95 },
      { lat: 35.0145, lng: -120.0034, confidence: 0.88 },
      { lat: 35.011, lng: -120.0089, confidence: 0.76 },
    ];

    setDetections(mockDetections);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Vulture Detection Dashboard</h1>
        <p>Total detections: {detections.length}</p>
      </header>

      <main className="map-container">
        <VultureMap points={detections} />
      </main>
    </div>
  );
}

export default App;
