import React, { useState, useEffect } from "react";
import ModelViewer from "./ModelViewer";

function ScannerView() {
  // navigation state
  const [scannerMode, setScannerMode] = useState("capture"); // "capture", "generate", "view"

  // state
  const [activeModel, setActiveModel] = useState(
    "/public/generated_models/scene.glb",
  );
  const [capturedImages, setCapturedImages] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Fetch available sessions when in 'generate' mode
  useEffect(() => {
    if (scannerMode === "generate") {
      fetch("http://localhost:8000/sessions")
        .then((res) => res.json())
        .then((data) => {
          setAvailableSessions(data.sessions || []);
        })
        .catch((err) => console.error("Failed to load sessions:", err));
    }
  }, [scannerMode]);

  // Force image reload every second
  const [feedTick, setFeedTick] = useState(0);
  useEffect(() => {
    if (scannerMode === "capture") {
      const interval = setInterval(() => setFeedTick((t) => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [scannerMode]);

  //  function to simulate saving an image from the drone
  const handleCapture = async () => {
    try {
      const response = await fetch("http://localhost:8000/capture", {
        method: "POST",
      });

      if (response.ok) {
        setCapturedImages((prev) => prev + 1);
        console.log("Frame captured successfully");
      } else {
        console.error("Failed to capture. Is the drone feed running?");
      }
    } catch (err) {
      console.error("Error connecting to capture API:", err);
    }
  };

  const handleNewSession = async () => {
    try {
      const response = await fetch("http://localhost:8000/session/new", {
        method: "POST",
      });
      if (response.ok) {
        setCapturedImages(0); //reset ui counter
        console.log("New session started");
      }
    } catch (err) {
      console.error("Error creating a new session", err);
    }
  };

  // generation process
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let url = "http://localhost:8000/generate";
      if (selectedSessionId) {
        url += `?session_id=${selectedSessionId}`;
      }
      const response = await fetch(url, {
        method: "POST",
      });

      if (response.ok) {
        // backend runs this in the background. simulated wait time uh oh sorry
        // to let the GPU do the heavy lifting before switching to the view tab
        setTimeout(() => {
          setIsGenerating(false);
          setScannerMode("view");
        }, 5000);
      } else {
        console.error("Failed to start 3D generation");
        setIsGenerating(false);
      }
    } catch (err) {
      console.error("Error connecting to generate API:", err);
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="scanner-container"
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        height: "100%",
        color: "white",
      }}
    >
      {/* Sidebar Navigation */}
      <div
        className="scanner-sidebar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "200px",
          padding: "15px",
          border: "1px solid #333",
          //borderRadius: "1px",
          //backgroundColor: "#111827",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            borderBottom: "1px solid #333",
            paddingBottom: "10px",
            fontSize: "1rem",
          }}
        >
          Scanner Controls
        </h3>

        <button
          onClick={() => setScannerMode("capture")}
          style={{
            padding: "10px",
            //borderRadius: "6px",
            cursor: "pointer",
            backgroundColor: scannerMode === "capture" ? "#6d9100" : "#13170f",
            color: "white",
            border: "1px solid #2a371f",
            textAlign: "left",
          }}
        >
          1. Capture Data
        </button>

        <button
          onClick={() => setScannerMode("generate")}
          style={{
            padding: "10px",
            //borderRadius: "6px",
            cursor: "pointer",
            backgroundColor: scannerMode === "generate" ? "#6d9100" : "#13170f",
            color: "white",
            border: "1px solid #2a371f",
            textAlign: "left",
          }}
        >
          2. Process Model
        </button>

        <button
          onClick={() => setScannerMode("view")}
          style={{
            padding: "10px",
            //borderRadius: "6px",
            cursor: "pointer",
            backgroundColor: scannerMode === "view" ? "#6d9100" : "#13170f",
            color: "white",
            border: "1px solid #2a371f",
            textAlign: "left",
          }}
        >
          3. 3D Viewer
        </button>
      </div>

      {/* Main Viewport */}
      <div
        className="scanner-viewport"
        style={{
          flexGrow: 1,
          border: "1px solid #333",
          //borderRadius: "8px",
          overflow: "hidden",
          //backgroundColor:,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* CAPTURE */}
        {scannerMode === "capture" && (
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <h2>Reconnaissance Capture</h2>
            <p style={{ color: "#a5a5a5" }}>
              Fly drone over target area and capture frames for photogrammetry.
            </p>

            <div
              style={{
                width: "80%",
                height: "400px",
                backgroundColor: "#000",
                border: "2px dashed #2a371f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "20px 0",
                borderRadius: "8px",
              }}
            >
              <img
                src={`http://localhost:8000/feed?t=${feedTick}`}
                alt="Live Drone Feed"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span style={{ color: "#4b5563", display: "none" }}>
                [ Waiting for Drone Feed... ]
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button
                onClick={handleCapture}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "#6d9100",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Capture Frame
              </button>
              <button
                onClick={handleNewSession}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "#13170f",
                  color: "white",
                  border: "1px solid #2a371f",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Start New Scan
              </button>

              <span style={{ fontSize: "1.2rem" }}>
                Images in buffer:{" "}
                <strong style={{ color: "#6d9100" }}>{capturedImages}</strong>
              </span>
            </div>
          </div>
        )}

        {/* GENERATE */}
        {scannerMode === "generate" && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <h2>Synthesize Environment</h2>
            <p style={{ color: "#a5a5a5" }}>
              Convert captured 2D intelligence into a volumetric 3D scan.
            </p>

            <div
              style={{
                margin: "30px 0",
                padding: "30px",
                backgroundColor: "#050700",
                borderRadius: "8px",
                width: "400px",
                border: "1px solid #2a371f",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0" }}>
                Select Dataset to Process
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => setSelectedSessionId(null)}
                  style={{
                    padding: "10px",
                    backgroundColor:
                      selectedSessionId === null ? "#6d9100" : "#13170f",
                    color: "white",
                    border: "1px solid #2a371f",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Current Active Session ({capturedImages} Frames)
                </button>
                {availableSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    style={{
                      padding: "10px",
                      backgroundColor:
                        selectedSessionId === s.id ? "#6d9100" : "#13170f",
                      color: "white",
                      border: "1px solid #2a371f",
                      borderRadius: "4px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {s.id.replace("session_", "Scan ")} ({s.image_count} Frames)
                  </button>
                ))}
              </div>
            </div>

            {isGenerating ? (
              <div
                style={{
                  color: "#6d9100",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  marginTop: "20px",
                  animation: "pulse 1.5s infinite",
                }}
              >
                Processing geometry... Please stand by.
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={capturedImages === 0 && selectedSessionId === null}
                style={{
                  padding: "14px 28px",
                  fontSize: "16px",
                  backgroundColor:
                    capturedImages === 0 && selectedSessionId === null
                      ? "#13170f"
                      : "#6d9100",
                  color:
                    capturedImages === 0 && selectedSessionId === null
                      ? "#4a4a4a"
                      : "white",
                  border: "1px solid #2a371f",
                  borderRadius: "4px",
                  cursor:
                    capturedImages === 0 && selectedSessionId === null
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "bold",
                }}
              >
                {capturedImages === 0 && selectedSessionId === null
                  ? "Insufficient Data (Select a valid session)"
                  : "Initialize 3D Generation"}
              </button>
            )}
          </div>
        )}

        {/*VIEW */}
        {scannerMode === "view" && <ModelViewer modelUrl={activeModel} />}
      </div>
    </div>
  );
}

export default ScannerView;
