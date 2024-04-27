import React, { useState, useEffect } from "react";
import Map from "./Map";
function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);
  return (
    <div>
      <Map currentLocation={currentLocation} />
    </div>
  );
}

export default App;
