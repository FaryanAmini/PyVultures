import React, { useState } from "react";
import ModelViewer from "./ModelViewer";

function ScannerView() {
  // navigation state
  const [scannerMode, setScannerMode] = useState("capture"); // "capture", "generate", "view"

  // state
  const [activeModel, setActiveModel] = useState("/test.glb");
  const [capturedImages, setCapturedImages] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  //  function to simulate saving an image from the drone
  const handleCapture = () => {
    setCapturedImages((prev) => prev + 1);
    // TODO: request to backend to save current frame to a session folder
  };

  // generation process
  const handleGenerate = () => {
    setIsGenerating(true);
    // generation time
    setTimeout(() => {
      setIsGenerating(false);
      setScannerMode("view");
    }, 3000);
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
              <span style={{ color: "#4b5563" }}>
                [ Live Drone Feed Preview ]
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
              }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>
                Dataset: {capturedImages} Frames
              </h3>
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
                disabled={capturedImages === 0}
                style={{
                  padding: "14px 28px",
                  fontSize: "16px",
                  backgroundColor: capturedImages === 0 ? "#13170f" : "#6d9100",
                  color: capturedImages === 0 ? "#4a4a4a" : "white",
                  border: "1px solid #2a371f",
                  borderRadius: "4px",
                  cursor: capturedImages === 0 ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                }}
              >
                {capturedImages === 0
                  ? "Insufficient Data (Capture First)"
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
