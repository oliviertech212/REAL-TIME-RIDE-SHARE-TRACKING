import React, { useState, useEffect } from "react";
import Map from "./Map";
import Map2 from "./Map2";
import MyMap from "./Map3";
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

      {/* // This is last one */}
      {/* <MyMap /> */}
      {/* <Map2 /> */}
    </div>
  );
}

export default App;
