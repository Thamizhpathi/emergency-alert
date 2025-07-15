import { useState, useEffect } from "react";
import { GoClock } from "react-icons/go";
import "../Styles/location.style.css";
import { MdOutlineNotListedLocation } from "react-icons/md";
import { CiLocationArrow1 } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { FadeLoader } from "react-spinners";

const LocationAlert = ({ onUpdate }) => {
  const [location, setLocation] = useState(null);
  const [lastAlertTime, setLastAlertTime] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved alert from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("emergencyAlert");
    if (saved) {
      const data = JSON.parse(saved);
      setLocation({ lat: data.latitude, lon: data.longitude });
      setLastAlertTime(data.timestamp);
      setPlaceName(data.placeName || "");
      if (onUpdate) onUpdate({ lat: data.latitude, lon: data.longitude });
    }
  }, [onUpdate]);

  // ✅ Reverse Geocoding using Nominatim (no API key needed)
  const reverseGeocode = async (lat, lon) => {
    try {
      const apiKey = "m/SorDPjvgw9I1173/VDwQ==BgTiEtPMT7ReuhTQ"; // 🔐 Replace with your actual API key

      const response = await fetch(
        `https://api.api-ninjas.com/v1/reversegeocoding?lat=${lat}&lon=${lon}`,
        {
          headers: {
            "X-Api-Key": apiKey,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const location = data[0];
        return `${location.name}, ${location.state}, ${location.country}`;
      }

      return "Unknown Location";
    } catch (err) {
      console.error("API Ninjas reverse geocoding failed:", err);
      return "Unknown Location";
    }
  };

  const handleSendAlert = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const timestamp = new Date().toISOString();

        const place = await reverseGeocode(latitude, longitude);

        const alertData = {
          latitude,
          longitude,
          timestamp,
          placeName: place,
        };
        localStorage.setItem("emergencyAlert", JSON.stringify(alertData));

        setLocation({ lat: latitude, lon: longitude });
        setLastAlertTime(timestamp);
        setPlaceName(place);
        setError("");
        setLoading(false);

        if (onUpdate) onUpdate({ lat: latitude, lon: longitude });
      },
      (err) => {
        setError(" Failed to get location: " + err.message);
        setLoading(false);
      }
    );
  };

  const formatTime = (isoTime) => {
    if (!isoTime) return "--";
    const date = new Date(isoTime);
    return date.toLocaleString();
  };

  return (
    <div className="container">
    
      {loading ? (
        <FadeLoader color="green"/>
      ) : (
        <button
          onClick={handleSendAlert}
          disabled={loading}
          className="alert-button"
        >
          Send Emergency Alert
        </button>
      )}
      {error && <p className="error-text">{error}</p>}

      {location && (
        <div className="info-box">
          <p>
            {" "}
            <div>
              {" "}
              <CiLocationArrow1 size={"25px"} className="icon" /> Location Name:
            </div>{" "}
            <div>{placeName || "Loading..."}</div>
          </p>
          <p>
            <div>
              <MdOutlineNotListedLocation size={"25px"} /> Coordinates:
            </div>{" "}
            <div>
              {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
            </div>{" "}
          </p>
          <p>
            <div>
              <GoClock size={"25px"} /> Time:
            </div>{" "}
            <div> {formatTime(lastAlertTime)}</div>
          </p>
          <div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              <FaGoogle size={"20px"} /> View on Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAlert;
