import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons not showing up correctly in React/Vite
import L from "leaflet";
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

// component that listens for point updates and flies the map to the new detections
function RecenterMap({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0 && points[0].gps) {
      // fly to the first point of the new set using the nested 'gps' object
      const firstPoint = [points[0].gps.lat, points[0].gps.lng];
      map.flyTo(firstPoint, map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [points, map]);

  return null;
}

export default function VultureMap({ points }) {
  //  center position if no points are present
  const defaultCenter = [35.0, -120.0];

  //  on the first point's nested GPS coordinates if they exist
  const center =
    points && points.length > 0 && points[0].gps
      ? [points[0].gps.lat, points[0].gps.lng]
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%", minHeight: "500px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/*  component handles smooth transitions to new points as they arrive */}
      <RecenterMap points={points} />

      {points &&
        points.map((point, index) => {
          //  render marker if GPS data exists to prevent crashes
          if (!point.gps) return null;

          return (
            <Marker key={index} position={[point.gps.lat, point.gps.lng]}>
              <Popup>
                <b>Vulture Detection #{index + 1}</b>
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
