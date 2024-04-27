import React, { useEffect } from "react";
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

  useEffect(() => {
    if (map && directionsRes && directionsRes.routes[0].legs[0].steps) {
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
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              // For each bus stop found
              results.forEach((place) => {
                // Calculate the distance to the transit station
                const distanceToStation =
                  google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(location),
                    place.geometry.location
                  );

                // Calculate the time to reach the transit station
                const timeToReach =
                  (distanceToStation /
                    directionsRes.routes[0].legs[0].distance.value) *
                  directionsRes.routes[0].legs[0].duration.value;

                console.log("timeToReach", timeToReach);
                // Create a marker on the map
                const marker = new google.maps.Marker({
                  map,
                  position: place.geometry.location,
                  title: `${place.name}: ${timeToReach} minutes`,
                });

                // Create an InfoWindow
                const infoWindow = new google.maps.InfoWindow({
                  content: `${place.name}: ${timeToReach} minutes`,
                });

                // Show the InfoWindow when the marker is clicked
                marker.addListener("click", () => {
                  infoWindow.open(map, marker);
                });
              });
            }
          }
        );
      });
    }
  }, [map, directionsRes]);

  const calculateRoute = async () => {
    if (originRef.current.value === "" && destinationRef.current.value === "") {
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: window.google.maps.TravelMode.TRANSIT,
      },
      async (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsRes(result);
          setDistance(result.routes[0].legs[0].distance.text);
          setDuration(result.routes[0].legs[0].duration.text);

          // Find the closest upcoming transit station
          let nextStation = null;
          let minExtraTime = Number.MAX_VALUE;

          for (const step of result.routes[0].legs[0].steps) {
            const location = {
              lat: step.start_location.lat(),
              lng: step.start_location.lng(),
            };
            const placesService = new google.maps.places.PlacesService(map);
            placesService.nearbySearch(
              {
                location: location,
                radius: 100, // Search within a 100m radius
                type: "transit_station",
              },
              (stations, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  for (const station of stations) {
                    // Perform directions request to estimate time to this station
                    const directionsRequest = {
                      origin: new google.maps.LatLng(
                        navigator.geolocation.getCurrentPosition().coords.latitude,
                        navigator.geolocation.getCurrentPosition().coords.longitude
                      ),
                      destination: station.geometry.location,
                      travelMode: window.google.maps.TravelMode.TRANSIT,
                    };
                    directionsService.route(
                      directionsRequest,
                      (stationResult, status) => {
                        if (status === google.maps.DirectionsStatus.OK) {
                          const extraTime =
                            stationResult.routes[0].legs[0].duration.value;
                          if (extraTime < minExtraTime) {
                            minExtraTime = extraTime;
                            nextStation = station;
                          }
                        }
                      }
                    );
                  }
                }
              }
            );
          }

          // Update UI with details of the next station (if found)
          if (nextStation) {
            console.log("Next station:", nextStation.name);
            // Display station name and estimated time on UI
          }
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
