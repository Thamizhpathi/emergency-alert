import { useEffect, useState } from "react";
import "../styles/NetworkStatus.css"; 

const NetworkStatus = () => {
  const [connectionType, setConnectionType] = useState(
    navigator.connection?.effectiveType || "unknown"
  );

  const getSignalBars = (type) => {
    switch (type) {
      case "4g":
        return 4;
      case "3g":
        return 3;
      case "2g":
        return 2;
      case "slow-2g":
        return 1;
      default:
        return 0;
    }
  };

  useEffect(() => {
    const connection = navigator.connection;

    const updateConnectionStatus = () => {
      setConnectionType(connection.effectiveType);
    };

    if (connection) {
      connection.addEventListener("change", updateConnectionStatus);
    }

    return () => {
      if (connection) {
        connection.removeEventListener("change", updateConnectionStatus);
      }
    };
  }, []);

  const totalBars = 4;
  const activeBars = getSignalBars(connectionType);

  return (
    <div className="network-container">
    
      <div className="bars connection">
     <p className="connection">{connectionType}</p> 
        {[...Array(totalBars)].map((_, i) => (
          <div
            key={i}
            className={`bar ${i < activeBars ? "active" : "inactive"}`}
            style={{ height: `${(i + 1) * 8}px` }}
          />
        ))}
      </div>
    </div>
  );
};

export default NetworkStatus;

