import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../Styles/map.style.css"
// Fix Leaflet's missing marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ CanvasOverlay must be used *inside* MapContainer
const CanvasOverlay = ({ lat, lon }) => {
  const map = useMap();
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateCanvasSize = () => {
      const container = map.getContainer();
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    const draw = () => {
      updateCanvasSize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const point = map.latLngToContainerPoint([lat, lon]);

      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.stroke();
    };

    draw();

    map.on("move", draw);
    map.on("zoom", draw);
    window.addEventListener("resize", draw);

    return () => {
      map.off("move", draw);
      map.off("zoom", draw);
      window.removeEventListener("resize", draw);
    };
  }, [lat, lon, map]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 500,
        pointerEvents: "none",
      }}
    />
  );
};

const UserMap = ({ location }) => {
  const [localLocation, setLocalLocation] = useState(null);
  const finalLocation = location || localLocation;

  useEffect(() => {
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocalLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      });
    }
  }, [location]);

  if (!finalLocation) return <p>Getting your location...</p>;

  return (
    <div className="map-container">
      <MapContainer
        center={[finalLocation.lat, finalLocation.lon]}
        zoom={13}
        scrollWheelZoom={true}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        <Marker position={[finalLocation.lat, finalLocation.lon]}>
          <Popup>You are here 📍</Popup>
        </Marker>

        {/* ✅ CanvasOverlay used correctly inside MapContainer */}
        <CanvasOverlay lat={finalLocation.lat} lon={finalLocation.lon} />
      </MapContainer>
    </div>
  );
};

export default UserMap;
