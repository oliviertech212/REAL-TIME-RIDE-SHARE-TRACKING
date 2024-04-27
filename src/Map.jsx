import React from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";

const Map = (props) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: [
      "streetView",
      "routes",
      "places",
      "geometry",
      "drawing",
      "visualization",
      "localContext",
    ],
  });

  const [map, setMap] = React.useState(null);
  const [directionsRes, setDirectionsRes] = React.useState(null);
  const [distance, setDistance] = React.useState(null);
  const [duration, setDuration] = React.useState(null);
  const originRef = React.useRef(null);
  const destinationRef = React.useRef(null);

  const calculateRoute = async () => {
    if (originRef.current.value === "" && destinationRef.current.value === "") {
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsRes(result);
          setDistance(result.routes[0].legs[0].distance.text);
          setDuration(result.routes[0].legs[0].duration.text);

          // Assuming `map` is an instance of google.maps.Map
          const placesService = new google.maps.places.PlacesService(map);

          // For each waypoint in the route
          directionsRes.routes[0].legs[0].steps.forEach((step) => {
            // Search for bus stops near the waypoint
            console.log("step", step.start_location);
            const location = {
              lat: step.start_location.lat(),
              lng: step.start_location.lng(),
            };
            placesService.nearbySearch(
              {
                location: location,
                radius: 200, // Search within a 500m radius
                type: "transit_station",
              },
              (results, status) => {
                console.log("results", results, status);
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  // For each bus stop found
                  results.forEach((place) => {
                    // Create a marker on the map
                    new google.maps.Marker({
                      map,
                      position: place.geometry.location,
                    });
                  });
                }
              }
            );
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  };

  const clearRoute = () => {
    setDirectionsRes(null);
    setDistance(null);
    setDuration(null);
    originRef.current.value = "";
    destinationRef.current.value = "";
  };

  console.log("api key", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }
  let center = {
    lat: -1.9578755,
    lng: 30.11273499999993,
  };

  if (props.currentLocation) {
    center = {
      lat: props.currentLocation.lat,
      lng: props.currentLocation.lng,
    };
  }

  return (
    <>
      <div className=" relativew-[100vw] h-[100vh] bg-white">
        <div className=" absolute top-0 bottom-0 left-0 right-0 h-[100%] w-[100%] ">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            zoom={10}
            center={center}
            // callback retun map object
            onLoad={(map) => {
              setMap(map);
            }}
          >
            <Marker position={center} />

            {/* display direction responses */}
            {directionsRes && <DirectionsRenderer directions={directionsRes} />}
          </GoogleMap>
        </div>

        <div
          className=" z-50 fixed  left-1/2 transform  right-1/2
          w-1/2 border rounded-md m-auto flex flex-col items-center shadow-md bg-white"
        >
          <div className="flex   m-auto  mt-3 ">
            <Autocomplete>
              <input
                placeholder="origin"
                className="bg-grey p-1 border"
                ref={originRef}
              />
            </Autocomplete>{" "}
            <Autocomplete>
              <input
                placeholder="direction"
                className="ml-2 p-1 bg-grey border"
                ref={destinationRef}
              />
            </Autocomplete>
            <button
              className="bg-[green] ml-2 p-1 rounded-md"
              onClick={calculateRoute}
            >
              Calculate Route
            </button>
            <button
              className="bg-[red] ml-2 px-3 rounded-md"
              onClick={clearRoute}
            >
              X
            </button>
          </div>

          <div className="flex justify-between w-full p-5">
            <h2>Distance : {distance} </h2>

            <h2>Duration : {duration} </h2>

            <button
              className="bg-[red] ml-2 px-3  rounded-md"
              onClick={() => map.panTo(props.currentLocation)}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Map;
