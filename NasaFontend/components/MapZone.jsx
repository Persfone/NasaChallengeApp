import { MapContainer, TileLayer, Polygon } from "react-leaflet";

const MapZonas = ({ zonas, center, zoom = 13 }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {zonas.map((zona, idx) => (
        <Polygon
          key={idx}
          positions={zona.coords}  // un array de puntos [{lat, lng}, …]
          pathOptions={{
            fillColor: zona.color,
            color: zona.color,
            weight: 2,
            fillOpacity: 0.5,
          }}
        />
      ))}
    </MapContainer>
  );
};

export default MapZonas;
