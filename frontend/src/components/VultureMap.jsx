import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// fix for default marker icons not showing up correctly in React/Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

const createTacticalMarker = (className) => {
  let color = "#808080";
  if (className == "person") {
    color = "#fc6b03";
  } else if (className == "car") {
    color = "#0313fc";
  } else if (className == "bicycle" || className == "motorcycle") {
    color = "#f0fc03";
  }
  // create css dot
  return L.divIcon({
    className: "tactical-marker",
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 8px ${color};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7], // centers the dot on the GPS coordinate
    popupAnchor: [0, -10],
  });
};

// component that listens for point updates and flies the map to the new detections
function RecenterMap({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0 && points[0].gps) {
      // fly to the first point of the new set using the nested 'gps' object
      const firstPoint = [points[0].gps.lat, points[0].gps.lng];
      map.panTo(firstPoint, map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [points, map]);

  return null;
}

// heatmap layer component using leaflet.heat
function HeatmapLayer({ points, active }) {
  const map = useMap();

  useEffect(() => {
    // if heatmap mode is not active or no points exist, return early
    if (!active || !points || points.length === 0) return;

    // convert yolo detections to heatmap data format [lat, lng, intensity]
    const heatData = points
      .filter((p) => p.gps != null)
      .map((p) => [
        p.gps.lat,
        p.gps.lng,
        p.confidence || 0.5, // use confidence as heat intensity
      ]);

    // create and add the heatmap layer
    const heatLayer = L.heatLayer(heatData, {
      radius: 35,
      blur: 15,
      maxZoom: 15,
      max: 1.0,
      gradient: { 0.4: "blue", 0.65: "lime", 1: "red" },
    }).addTo(map);

    // clean up layer on unmount or update
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, active, map]);

  return null;
}

export default function VultureMap({ points, mode = "pins" }) {
  // center position if no points are present
  const defaultCenter = [35.0, -120.0];

  // on the first point's nested GPS coordinates if they exist
  const center =
    points && points.length > 0 && points[0].gps
      ? [points[0].gps.lat, points[0].gps.lng]
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100vh", width: "100vw", minHeight: "500px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* component handles smooth transitions to new points as they arrive */}
      <RecenterMap points={points} />

      {/* inject heatmap layer component */}
      <HeatmapLayer points={points} active={mode === "heatmap"} />

      {/* render pins only if in pins mode */}
      {mode === "pins" &&
        points &&
        points.map((point, index) => {
          // render marker if GPS data exists to prevent crashes
          if (!point.gps) return null;

          // custom tactical marker using class_name for color
          const tacticalIcon = createTacticalMarker(point.class_name);

          return (
            <Marker
              key={index}
              position={[point.gps.lat, point.gps.lng]}
              icon={tacticalIcon}
            >
              <Popup>
                <b>
                  Target Identified:{" "}
                  {point.class_name
                    ? point.class_name.toUpperCase()
                    : "UNKNOWN"}
                </b>
                <br />
                Lat: {point.gps.lat.toFixed(5)}
                <br />
                Lng: {point.gps.lng.toFixed(5)}
                <br />
                Confidence:{" "}
                {point.confidence
                  ? `${(point.confidence * 100).toFixed(1)}%`
                  : "N/A"}
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
