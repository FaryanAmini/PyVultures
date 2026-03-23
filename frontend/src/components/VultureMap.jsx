import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// default marker icons not showing up correctly in React
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

export default function VultureMap({ points }) {
  // center the map on the first poin
  const center =
    points.length > 0 ? [points[0].lat, points[0].lng] : [35.0, -120.0]; // replace with a default coord

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

      {points.map((point, index) => (
        <Marker key={index} position={[point.lat, point.lng]}>
          <Popup>
            <b>Vulture Detection #{index + 1}</b>
            <br />
            Lat: {point.lat.toFixed(5)}
            <br />
            Lng: {point.lng.toFixed(5)}
            <br />
            Confidence:{" "}
            {point.confidence
              ? `${(point.confidence * 100).toFixed(1)}%`
              : "N/A"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
