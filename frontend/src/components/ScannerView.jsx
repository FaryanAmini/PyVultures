import React, { useState, useEffect } from "react";
import ModelViewer from "./ModelViewer";

function ScannerView() {
  // navigation state
  const [scannerMode, setScannerMode] = useState("capture"); // "capture", "generate", "view"

  // state
  const [activeModel, setActiveModel] = useState("/latest.glb");
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
        // to let the GPU do the heavy lifting before switching to the view tab
        const data = await response.json();
        const targetSessionId = data.session_id;

        // check generation status periodically
        const statusInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(
              `http://localhost:8000/generate/status/${targetSessionId}`,
            );
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.status === "completed") {
                clearInterval(statusInterval);
                setIsGenerating(false);
                setActiveModel("/latest.glb?v=" + Math.random());
                setScannerMode("view");
              } else if (statusData.status === "failed") {
                clearInterval(statusInterval);
                setIsGenerating(false);
                console.error("Generation failed:", statusData.message);
              }
            }
          } catch (err) {
            clearInterval(statusInterval);
            setIsGenerating(false);
            console.error("Error checking generation status:", err);
          }
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
        color: "var(--textPrimary)",
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
          border: "1px solid var(--border)",
          //borderRadius: "1px",
          //backgroundColor: "#111827",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            borderBottom: "1px solid var(--border)",
            paddingBottom: "10px",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          Scanner Controls
        </h3>

        <button
          onClick={() => setScannerMode("capture")}
          style={{
            padding: "10px",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor:
              scannerMode === "capture"
                ? "var(--accent)"
                : "var(--surfaceHover)",
            color:
              scannerMode === "capture" ? "var(--bg)" : "var(--textPrimary)",
            border:
              scannerMode === "capture"
                ? "1px solid var(--accent)"
                : "1px solid var(--border)",
            boxShadow:
              scannerMode === "capture"
                ? "0 0 15px var(--accentMuted), 0 0 5px var(--accent)"
                : "none",
            textAlign: "left",
            fontFamily: "inherit",
            fontWeight: scannerMode === "capture" ? 600 : 500,
            transition: "all 0.2s ease",
          }}
        >
          1. Capture Data
        </button>

        <button
          onClick={() => setScannerMode("generate")}
          style={{
            padding: "10px",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor:
              scannerMode === "generate"
                ? "var(--accent)"
                : "var(--surfaceHover)",
            color:
              scannerMode === "generate" ? "var(--bg)" : "var(--textPrimary)",
            border:
              scannerMode === "generate"
                ? "1px solid var(--accent)"
                : "1px solid var(--border)",
            boxShadow:
              scannerMode === "generate"
                ? "0 0 15px var(--accentMuted), 0 0 5px var(--accent)"
                : "none",
            textAlign: "left",
            fontFamily: "inherit",
            fontWeight: scannerMode === "generate" ? 600 : 500,
            transition: "all 0.2s ease",
          }}
        >
          2. Process Model
        </button>

        <button
          onClick={() => setScannerMode("view")}
          style={{
            padding: "10px",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor:
              scannerMode === "view" ? "var(--accent)" : "var(--surfaceHover)",
            color: scannerMode === "view" ? "var(--bg)" : "var(--textPrimary)",
            border:
              scannerMode === "view"
                ? "1px solid var(--accent)"
                : "1px solid var(--border)",
            boxShadow:
              scannerMode === "view"
                ? "0 0 15px var(--accentMuted), 0 0 5px var(--accent)"
                : "none",
            textAlign: "left",
            fontFamily: "inherit",
            fontWeight: scannerMode === "view" ? 600 : 500,
            transition: "all 0.2s ease",
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
          border: "1px solid var(--border)",
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
            <h2 style={{ fontWeight: 600 }}>Reconnaissance Capture</h2>
            <p style={{ color: "var(--textSecondary)" }}>
              Fly drone over target area and capture frames for photogrammetry.
            </p>

            <div
              style={{
                width: "80%",
                height: "400px",
                backgroundColor: "var(--bg)",
                border: "2px dashed var(--borderBright)",
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
              <span
                className="tactical-mono"
                style={{ color: "var(--textMuted)", display: "none" }}
              >
                [ Waiting for Drone Feed... ]
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button
                onClick={handleCapture}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "var(--accent)",
                  color: "var(--bg)",
                  border: "1px solid var(--accent)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  boxShadow:
                    "0 0 15px var(--accentMuted), 0 0 5px var(--accent)",
                }}
              >
                Capture Frame
              </button>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  id="autoCapture"
                  onChange={(e) => {
                    if (e.target.checked) {
                      window._autoCaptureInterval = setInterval(
                        handleCapture,
                        1000,
                      );
                    } else {
                      clearInterval(window._autoCaptureInterval);
                    }
                  }}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                Auto Capture
              </label>

              <button
                onClick={handleNewSession}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  backgroundColor: "var(--surface)",
                  color: "var(--textPrimary)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
              >
                Start New Scan
              </button>

              <span style={{ fontSize: "1.2rem", marginLeft: "15px" }}>
                <span
                  className="tactical-mono"
                  style={{ fontSize: "0.9em", color: "var(--textSecondary)" }}
                >
                  BUFFER:{" "}
                </span>
                <strong
                  className="tactical-mono"
                  style={{
                    color: "var(--accent)",
                    textShadow: "0 0 8px var(--accentMuted)",
                    fontSize: "1.2em",
                  }}
                >
                  {capturedImages}
                </strong>
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
            <h2 style={{ fontWeight: 600 }}>Synthesize Environment</h2>
            <p style={{ color: "var(--textSecondary)" }}>
              Convert captured 2D intelligence into a volumetric 3D scan.
            </p>

            <div
              style={{
                margin: "30px 0",
                padding: "30px",
                backgroundColor: "var(--surfaceHover)",
                borderRadius: "8px",
                width: "400px",
                border: "1px solid var(--border)",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              <h3 style={{ margin: "0 0 15px 0", fontWeight: 600 }}>
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
                      selectedSessionId === null
                        ? "var(--accent)"
                        : "var(--surface)",
                    color:
                      selectedSessionId === null
                        ? "var(--bg)"
                        : "var(--textPrimary)",
                    border:
                      selectedSessionId === null
                        ? "1px solid var(--accent)"
                        : "1px solid var(--border)",
                    boxShadow:
                      selectedSessionId === null
                        ? "0 0 10px var(--accentMuted)"
                        : "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontWeight: 500,
                  }}
                >
                  Current Active Session{" "}
                  <span
                    className="tactical-mono"
                    style={{ float: "right", fontSize: "0.85em", opacity: 0.8 }}
                  >
                    ({capturedImages})
                  </span>
                </button>
                {availableSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    style={{
                      padding: "10px",
                      backgroundColor:
                        selectedSessionId === s.id
                          ? "var(--accent)"
                          : "var(--surface)",
                      color:
                        selectedSessionId === s.id
                          ? "var(--bg)"
                          : "var(--textPrimary)",
                      border:
                        selectedSessionId === s.id
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      boxShadow:
                        selectedSessionId === s.id
                          ? "0 0 10px var(--accentMuted)"
                          : "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      fontWeight: 500,
                    }}
                  >
                    {s.id.replace("session_", "Scan ")}{" "}
                    <span
                      className="tactical-mono"
                      style={{
                        float: "right",
                        fontSize: "0.85em",
                        opacity: 0.8,
                      }}
                    >
                      ({s.image_count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {isGenerating ? (
              <div
                className="tactical-mono"
                style={{
                  color: "var(--accent)",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  marginTop: "20px",
                  animation: "pulse 1.5s infinite",
                  textShadow: "0 0 10px var(--accentMuted)",
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
                      ? "var(--surface)"
                      : "var(--accent)",
                  color:
                    capturedImages === 0 && selectedSessionId === null
                      ? "var(--textMuted)"
                      : "var(--bg)",
                  border:
                    capturedImages === 0 && selectedSessionId === null
                      ? "1px solid var(--border)"
                      : "1px solid var(--accent)",
                  boxShadow:
                    capturedImages === 0 && selectedSessionId === null
                      ? "none"
                      : "0 0 15px var(--accentMuted), 0 0 5px var(--accent)",
                  borderRadius: "4px",
                  cursor:
                    capturedImages === 0 && selectedSessionId === null
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "bold",
                  fontFamily: "inherit",
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
