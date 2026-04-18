import React, { useState } from "react";
import ModelViewer from "./ModelViewer";

function ScannerView() {
  // URL will come from backend database
  // test model loaded in
  const [activeModel, setActiveModel] = useState("/test.glb");

  return (
    <div
      className="scanner-container"
      style={{ display: "flex", gap: "20px", padding: "20px" }}
    >
      {/* Sidebar */}
      <div
        className="scanner-sidebar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "150px",
          padding: "10px",
          border: "1px solid #333",
          borderRadius: "8px",
          backgroundColor: "#1a1a1a",
        }}
      >
        <button
          style={{ padding: "10px", borderRadius: "6px", cursor: "pointer" }}
        >
          Button 1
        </button>
        <button
          style={{ padding: "10px", borderRadius: "6px", cursor: "pointer" }}
        >
          Button 2
        </button>
        <button
          style={{ padding: "10px", borderRadius: "6px", cursor: "pointer" }}
        >
          Button 3
        </button>
      </div>

      {/* Main 3D Viewport */}
      <div
        className="scanner-viewport"
        style={{
          flexGrow: 1,
          border: "1px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Render the 3D viewer */}
        <ModelViewer modelUrl={activeModel} />
      </div>
    </div>
  );
}

export default ScannerView;
