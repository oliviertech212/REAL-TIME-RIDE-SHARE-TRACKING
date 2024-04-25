import React from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
const center = {
  lat: -1.9578755,
  lng: 30.11273499999993,
};

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

  // console.log("api key", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  console.log("Google Maps API loaded successfully", props);
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
            <Marker position={props.currentLocation} />
          </GoogleMap>
        </div>

        <div
          className=" z-50 fixed  left-1/2 transform  right-1/2
          w-1/2 border rounded-md h-52 m-auto flex flex-col items-center shadow-md bg-white"
        >
          <div className="flex   m-auto  ">
            <Autocomplete>
              <input placeholder="origin" className="bg-grey p-1 border" />
            </Autocomplete>{" "}
            <Autocomplete>
              <input
                placeholder="direction"
                className="ml-2 p-1 bg-grey border"
              />
            </Autocomplete>
            <button className="bg-[green] ml-2 p-1 rounded-md">
              Calculate Route
            </button>
            <button className="bg-[red] ml-2 px-3 rounded-md">X</button>
          </div>

          <div className="flex justify-between w-full p-5">
            <h2>Distance : </h2>

            <h2>Duration : </h2>

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
