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
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
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
                radius: 100, // Search within a 500m radius
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
      <div className="  md:flex w-[100vw] h-[100vh] bg-white">
        <div
          className=" z-50  relative
         w-full md:w-1/4  border rounded-md  p-5   shadow-md  md:bg-white"
        >
          <div className="  w-full  m-auto  mt-3 ">
            <div className=" flex md:flex-col space-x-1 md:space-x-0">
              <Autocomplete>
                <input
                  placeholder="origin"
                  className="bg-grey p-1 border-2 border-black w-full"
                  ref={originRef}
                />
              </Autocomplete>{" "}
              <Autocomplete>
                <input
                  placeholder="direction"
                  className="md:mt-2 bg-grey p-1 border-2 border-black w-full"
                  ref={destinationRef}
                />
              </Autocomplete>
            </div>
            <div>
              <button
                className="bg-blue-500 mt-2 p-1 rounded-md"
                onClick={calculateRoute}
              >
                Calculate
              </button>
              <button
                className="bg-[red] ml-2 px-3 py-1 rounded-md"
                onClick={clearRoute}
              >
                Clear
              </button>
            </div>
          </div>

          <div className=" w-full  mt-3 ">
            <div className="flex w-full justify-between">
              <h2>Distance : {distance} </h2>

              <h2>Time : {duration} </h2>
            </div>
          </div>

          <div className="my-3">
            <button
              className="bg-[grey] ml-0 px-3  absolute bottom-0 md:bottom-20  rounded-md"
              onClick={() => map.panTo(props.currentLocation)}
            >
              Go to my location
            </button>
          </div>
        </div>
        <div className="  h-[100%] w-[100%] ">
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
      </div>
    </>
  );
};

export default Map;
