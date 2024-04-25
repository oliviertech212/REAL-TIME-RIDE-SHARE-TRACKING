import Map from "./Map";
import { useState, useEffect } from "react";

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  }, []);
  return (
    <div>
      <Map currentLocation={currentLocation} />
    </div>
  );
}

export default App;
