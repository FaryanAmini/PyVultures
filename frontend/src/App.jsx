import { useState } from "react";
import LiveReconView from "./components/LiveReconView";
import ScannerView from "./components/ScannerView";
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
        </nav>
      </header>

      <main className="content-area">
        {activeTab === "live" ? <LiveReconView /> : <ScannerView />}
      </main>
    </div>
  );
}

export default App;
