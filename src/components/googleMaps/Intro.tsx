import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { googleApiKey } from "../../googleApiKey";
import { shelters } from "../../TLV-shelters-data copy";
import Directions from "./Directions";

export default function Intro() {
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Get the user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location: ", error);
        // Fallback to a default location if geolocation fails
        setPosition({ lat: 32.109333, lng: 34.855499 });
      }
    );
  }, []);

  if (!position) {
    // Optionally, you can return a loading indicator while the location is being fetched
    return <div>Loading...</div>;
  }

  return (
    <APIProvider apiKey={googleApiKey}>
      <div style={{ height: "80vh", width: "80%" }}>
        <Map
          defaultZoom={13}
          defaultCenter={position}
          mapId={"aa21e74a7cd52a60"}
          fullscreenControl={false}
        >
          <AdvancedMarker position={position} onClick={() => setOpen(true)}>
            <Pin />
          </AdvancedMarker>
          {open && (
            <InfoWindow
              position={position}
              onCloseClick={() => setOpen(false)}
            ></InfoWindow>
          )}
          <Shelters points={shelters} />
        </Map>
      </div>
    </APIProvider>
  );
}

export type Point = {
  address: string;
  capacity: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  notes: string;
  accessibility: boolean;
  _id: string;
};

export type Props = { points: Point[] };

function Shelters({ points }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [destination, setDestination] = useState<Point | null>(null);

  return (
    <>
      {points.map((point) => {
        const position = {
          lat: point.coordinates.latitude,
          lng: point.coordinates.longitude,
        };

        return (
          <div key={point._id}>
            <AdvancedMarker
              position={position}
              onClick={() => setOpenId(point._id)}
            >
              <Pin />
            </AdvancedMarker>
            {openId === point._id && (
              <InfoWindow
                position={position}
                onCloseClick={() => setOpenId(null)}
              >
                <div>
                  <p>{point.address}</p>
                  <button onClick={() => setDestination(point)}>
                    Navigate
                  </button>
                </div>
              </InfoWindow>
            )}
          </div>
        );
      })}

      {destination && <Directions destination={destination} />}
    </>
  );
}
