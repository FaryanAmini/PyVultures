import { useState, useEffect } from "react";
import VultureMap from "./VultureMap";

function LiveReconView() {
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    const fetchDetections = () => {
      fetch("http://localhost:8000/detections")
        .then((res) => res.json())
        .then((data) => {
          setDetections(data.detections || []);
        })
        .catch((err) => {
          console.error("Error fetching detections:", err);
        });
    };

    fetchDetections();
    const intervalId = setInterval(fetchDetections, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="view-container">
      <div className="status-bar">
        <h3>Live Intelligence Feed</h3>
        <p>Active Detections: {detections.length}</p>
      </div>
      <div className="map-wrapper">
        <VultureMap points={detections} />
      </div>
    </div>
  );
}

export default LiveReconView;
