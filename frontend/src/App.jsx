import { useState, useEffect } from "react";
import VultureMap from "./components/VultureMap";
import "./App.css";

function App() {
  const [detections, setDetections] = useState([]);

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
    <div className="app-container">
      <header className="header">
        <h1>newVultures Dashboard</h1>
        <p>Current detections: {detections.length}</p>
      </header>

      <main className="map-container">
        <VultureMap points={detections} />
      </main>
    </div>
  );
}

export default App;
