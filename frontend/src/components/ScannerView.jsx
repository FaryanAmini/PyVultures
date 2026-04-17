import React, { useState } from "react";
import ModelViewer from "./ModelViewer";

function ScannerView() {
  // URL will come from your backend database
  // test model loaded in
  const [activeModel, setActiveModel] = useState("/test.glb");

  return (
    <div
      className="scanner-container"
      style={{ display: "flex", gap: "20px", padding: "20px" }}
    >
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
