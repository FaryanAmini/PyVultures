import { useState } from "react";
import LiveReconView from "./components/LiveReconView";
import ScannerView from "./components/ScannerView";
import IntelCanvas from "./components/IntelCanvas";

import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("live");

  return (
    <div className="app-container">
      <header className="header">
        <h1>newVultures Dashboard</h1>
        <nav className="tab-navigation">
          <button
            className={activeTab === "live" ? "active" : ""}
            onClick={() => setActiveTab("live")}
          >
            Live Recon
          </button>
          <button
            className={activeTab === "scanner" ? "active" : ""}
            onClick={() => setActiveTab("scanner")}
          >
            3D Scanner
          </button>
          <button
            className={activeTab === "intel" ? "active" : ""}
            onClick={() => setActiveTab("intel")}
          >
            Intel Canvas
          </button>
        </nav>
      </header>

      <main className="content-area">
        {activeTab === "live" ? (
          <LiveReconView />
        ) : activeTab === "scanner" ? (
          <ScannerView />
        ) : (
          <IntelCanvas />
        )}
      </main>
    </div>
  );
}

export default App;
