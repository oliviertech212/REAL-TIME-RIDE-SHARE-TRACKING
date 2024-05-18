import React, { useEffect, useState, useRef } from "react";

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  DirectionsRenderer,
  DirectionsService,
  StreetViewPanorama,
} from "@react-google-maps/api";
// import { IoMenu } from "react-icons/io5";
const libraries = ["places", "directions"];
let stops = [
  { lat: -1.939826787816454, lng: 30.0445426438232 },
  { lat: -1.9355377074007851, lng: 30.060163829002217 },
  { lat: -1.9358808342336546, lng: 30.08024820994666 },
  { lat: -1.9489196023037583, lng: 30.092607828989397 },
  { lat: -1.9592132952818164, lng: 30.106684061788073 },
  { lat: -1.9487480402200394, lng: 30.126596781356923 },
  { lat: -1.9365670876910166, lng: 30.13020167024439 },
];
const MyMap = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries,
  });
  const [hidemenu, setHidemenu] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState(null);
  const [nextStopName, setNextStopName] = useState("");
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [duration, setDuration] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        calculateEta();
      });
    }
  }, []);

  if (currentLocation) {
    stops[0] = currentLocation;
  }

  const calculateDirection = async () => {
    var directionsService = new window.google.maps.DirectionsService();

    const waypoints = stops.slice(1, -1).map((stop) => ({
      location: { lat: stop.lat, lng: stop.lng },
      stopover: true,
    }));

    let directionreq = {
      origin: stops[0],
      destination: stops[stops.length - 1],
      waypoints: waypoints,
      travelMode: "DRIVING",

      provideRouteAlternatives: false,
      // unitSystem: google.maps.UnitSystem.IMPERIAL,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      // UnitSystem.METRIC
    };

    try {
      const res = await directionsService.route(directionreq);
      if (res.status === "OK") {
        // Calculate time and distance between waypoints  in reatime base on current waypoint
        //   calculate and display estimated time between waypint
        setDirections(res);
      } else {
        console.error("Error fetching directions:", res.status);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };
  const calculateEta = () => {
    if (directions && currentLocation) {
      const route = directions.routes[0];

      let totalDistance = 0;
      let totalDuration = 0;
      let currentIndex = 0;

      for (let i = 0; i < route.legs.length; i++) {
        const leg = route.legs[i];
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;

        console.log(
          "leg",
          leg,
          "totalDistance",
          totalDistance,
          "totalDuration",
          totalDuration
        );

        if (
          currentLocation.lat === stops[i].lat &&
          currentLocation.lng === stops[i].lng
        ) {
          currentIndex = i;
        }
      }

      setNextStopName(route.legs[currentIndex].end_address);
      setDuration(route.legs[currentIndex].duration.text);
      setDistance(route.legs[currentIndex].distance.text);

      // console.log(
      //   "currentIndex",
      //   currentIndex,
      //   "routeggg",
      //   route.legs,
      //   "directions",
      //   directions.routes
      // );

      const remainingDistance = route.legs[currentIndex].distance.value;
      const remainingDuration = route.legs[currentIndex].duration.value;
      const averageSpeed = remainingDistance / remainingDuration;

      console.log(
        "averageSpeed",
        averageSpeed,
        "remainingDuration",
        remainingDuration,
        "remainingDistance",
        remainingDistance
      );
      const eta = remainingDuration / 60; // in minutes

      setEta(eta);
    }
  };

  console.log("duration", duration, "distance", distance);

  useEffect(() => {
    calculateDirection();
  }, [isLoaded]);

  if (loadError) {
    return <div>Something wrong while loading map</div>;
  }
  if (!isLoaded) {
    return <div> loading............................................. </div>;
  }

  return (
    <div className=" md:flex w-[100vw] h-[100vh]  bg-white">
      <div className="  md:hidden flex items-center  justify-between h-16 p-5   bg-gradient-to-r from-cyan-300 to-green-500  ">
        {/* <IoMenu size={30} className="" onClick={() => setHidemenu(!hidemenu)} /> */}
        <button
          className="bg-blue w-10 h-5"
          onClick={() => setHidemenu(!hidemenu)}
        ></button>

        <h2 className="font-bold  text-2xl">StartUp</h2>
      </div>

      {hidemenu && (
        <div className=" md:hidden relative w-full md:w-1/4 border rounded-md p-5 shadow-md md:bg-white">
          <div className="w-full  font-bold  text-2xl space-x-3 flex m-auto mt-3 ">
            <h2>Nyabugogo</h2> <span>-</span> <h2>Kimironko</h2>
          </div>

          <div className="w-full font-semibold mt-3 ">
            <div className="flex w-full justify-between">
              <h2>Next stop : </h2>
            </div>
            <div className="flex w-full justify-between">
              <h2>Distance :</h2>
              <h2>Time : </h2>
            </div>
          </div>

          <div className="my-3"></div>
          <div>ETA to next stop: </div>
        </div>
      )}
      <div className="  bg-gradient-to-r from-cyan-300 to-green-500 hidden md:block relative w-full md:w-1/4 border rounded-md p-5 shadow-md md:bg-white">
        <div className="w-full font-semibold mt-3 ">
          <div className="flex w-full justify-between">
            <h2>Next stop:</h2>
            <h2>{nextStopName}</h2>
          </div>
          <div className="flex w-full justify-between">
            <h2>Distance:</h2>
            <h2>{distance}</h2>
          </div>
          <div className="flex w-full justify-between">
            <h2>Time:</h2>
            <h2>{duration}</h2>
          </div>
        </div>

        <div className="my-3"></div>

        {/* <div>
          ETA to next stop: {eta ? `${eta.toFixed(2)} minutes` : "Loading..."}
        </div> */}
      </div>
      <div className=" h-[100%] w-[100%]  ">
        <GoogleMap
          center={currentLocation || stops[0]}
          zoom={15}
          mapContainerStyle={{ width: "90%", height: "100%" }}
        >
          {/* <DirectionsService
            
          />{" "} */}
          {directions && <DirectionsRenderer directions={directions} />}

          {currentLocation && (
            <Marker
              position={currentLocation}
              icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            />
          )}

          {/* <StreetViewPanorama position={currentLocation} visible={true} /> */}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MyMap;
