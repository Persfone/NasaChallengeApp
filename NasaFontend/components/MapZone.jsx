import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import HeatmapCanvas from "./HeatmapCanvas";

const MapController = ({ center, zoom }) => {
  const map = useMap();
  if (center && zoom) map.flyTo(center, zoom, { duration: 1.5 });
  return null;
};

const MapInteractionHandler = ({ isDraggingDisabled, minZoomLevel }) => {
  const map = useMap();
  useEffect(() => {
    if (isDraggingDisabled) map.dragging.disable();
    else map.dragging.enable();
    map.options.minZoom = minZoomLevel;
  }, [isDraggingDisabled, minZoomLevel, map]);
  return null;
};

const MapZonas = ({ zonas, center, zoom, selectedLocation, children, heatmapData }) => {
  const [leafletMap, setLeafletMap] = useState(null);

  const currentCenter = selectedLocation ? selectedLocation.center : center;
  const currentZoom = selectedLocation ? selectedLocation.zoom : zoom;
  const minZoomLevel = selectedLocation ? selectedLocation.zoom : 3;
  const isDraggingDisabled = !!selectedLocation;

  return (
    <div className="relative w-full h-full">
      {children}

      <MapContainer
        whenCreated={setLeafletMap}
        center={currentCenter}
        zoom={currentZoom}
        minZoom={3}
        maxZoom={18}
        scrollWheelZoom={true}
        className="h-full w-full"
        maxBounds={[
          [24.396308, -125.0],
          [49.384358, -66.93457],
        ]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInteractionHandler
          isDraggingDisabled={isDraggingDisabled}
          minZoomLevel={minZoomLevel}
        />

        {selectedLocation && (
          <MapController center={selectedLocation.center} zoom={selectedLocation.zoom} />
        )}

        {zonas.map((zona, idx) => (
          <Polygon
            key={idx}
            positions={zona.coords}
            pathOptions={{
              fillColor: zona.color,
              color: zona.color,
              weight: 2,
              fillOpacity: 0.5,
            }}
          />
        ))}
        <HeatmapCanvas data={heatmapData} radius={25} intensityMultiplier={0.5} />
      </MapContainer>
    </div>
  );
};

export default MapZonas;
