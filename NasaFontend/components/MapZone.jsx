import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Componente interno para manejar la lógica de useMap
const MapEffect = () => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
};

const MapZonas = ({ zonas, center, zoom = 13 }) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {zonas && zonas.map((zona, idx) => (
        <Polygon 
          key={idx}
          positions={zona.coordinates}
          pathOptions={{ color: zona.color || 'blue' }}
        />
      ))}
      
      <MapEffect />
    </MapContainer>
  );
};

export default MapZonas;