import { useState, useEffect } from "react";
import VultureMap from "./VultureMap";

function LiveReconView() {
  const [detections, setDetections] = useState([]);
  // state to toggle between tactical pins and heatmap mode
  const [mapMode, setMapMode] = useState("pins"); // "pins" or "heatmap"

  useEffect(() => {
    const fetchDetections = () => {
      fetch("http://localhost:8000/detections")
        .then((res) => res.json())
        .then((data) => {
          // backend returns an object containing the detections list
          setDetections(data.detections || []);
        })
        .catch((err) => {
          console.error("Error fetching detections from backend:", err);
        });
    };

    // fetch on component load
    fetchDetections();

    // polling to fetch new points every 1 second
    const intervalId = setInterval(fetchDetections, 1000);

    // clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="view-container">
      <div className="status-bar">
        <h3>Live Intelligence Feed</h3>

        {/* toggle controls for map visualization */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setMapMode("pins")}
            style={toggleBtnStyle(mapMode === "pins")}
          >
            Tactical View
          </button>
          <button
            onClick={() => setMapMode("heatmap")}
            style={toggleBtnStyle(mapMode === "heatmap")}
          >
            Pattern of Life
          </button>
          <p style={{ marginLeft: "15px" }}>
            Active Detections: {detections.length}
          </p>
        </div>
      </div>

      <div className="map-wrapper">
        {/* pass the current mode to the map component */}
        <VultureMap points={detections} mode={mapMode} />
      </div>
    </div>
  );
}

// simple inline styling for the toggle buttons
const toggleBtnStyle = (isActive) => ({
  background: isActive ? "var(--accent)" : "var(--surface)",
  color: "var(--textPrimary)",
  border: "1px solid var(--border)",
  padding: "5px 15px",
  cursor: "pointer",
  borderRadius: "4px",
  fontSize: "0.8rem",
  fontWeight: isActive ? "bold" : "normal",
  transition: "all 0.2s ease",
});

export default LiveReconView;
