import { useState } from "react";
import "./App.css";
import Header from "./Components/Header";
import LocationAlert from "./Components/LocationAlert";

import NetworkStatus from "./Components/NetworkStatus";
import UserMap from "./Components/UserMap";

function App() {
  const [location, setLocation] = useState(null);

  return (
    <>
      <div className="nav-container">
        <Header />
        <NetworkStatus />
      </div>
      <LocationAlert onUpdate={setLocation} />
      <UserMap location={location} onLocationFound={setLocation} />
    </>
  );
}

export default App;
