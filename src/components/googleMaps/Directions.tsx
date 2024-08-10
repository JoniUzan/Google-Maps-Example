import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Point } from "./Intro";
import { useEffect, useState } from "react";

type DirectionsProps = { destination: Point };

function Directions({ destination }: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");

  const [directionService, setDirectionService] =
    useState<google.maps.DirectionsService>();

  const [directionRenderer, setDirectionRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionService(new routesLibrary.DirectionsService());
    setDirectionRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionService || !directionRenderer) return;

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Set destination from the shelter's coordinates
        const destinationCoordinates = {
          lat: destination.coordinates.latitude,
          lng: destination.coordinates.longitude,
        };

        directionService
          .route({
            origin,
            destination: destinationCoordinates,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true,
          })
          .then((response) => {
            directionRenderer.setDirections(response);
            setRoutes(response.routes);
          });
      },
      (error) => {
        console.error("Error getting location: ", error);
      }
    );
  }, [directionService, directionRenderer, destination]);

  useEffect(() => {
    if (!directionRenderer) return;

    directionRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionRenderer]);

  if (!leg) return null;

  return (
    <div>
      <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text} </p>
      <h2>Other Routes</h2>
      <ul>
        {routes.map((route, index) => {
          return (
            <li key={route.summary}>
              <button onClick={() => setRouteIndex(index)}>
                {route.summary}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Directions;
