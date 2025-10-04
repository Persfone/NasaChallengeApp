<<<<<<< HEAD
// /components/MapZonas.jsx
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";

const MapController = ({ center, zoom }) => {
    const map = useMap();
    if (center && zoom) {
        map.flyTo(center, zoom, { duration: 1.5 }); // Transición suave
    }
    return null;
};

// Se eliminan las props de control de zoom de App y se manejan internamente
const MapZonas = ({ zonas, center, zoom, selectedLocation, children }) => {
    
    const currentCenter = selectedLocation ? selectedLocation.center : center;
    const currentZoom = selectedLocation ? selectedLocation.zoom : zoom;
    
    // Si hay una ubicación seleccionada, el zoom out se fija al zoom de esa ubicación
    const minZoomLevel = selectedLocation ? selectedLocation.zoom : 3;
    const isDraggingDisabled = !!selectedLocation;

    // Hook para controlar el mapa cuando está listo
    const MapInteractionHandler = ({ isDraggingDisabled, minZoomLevel }) => {
        const map = useMap();

        // Controla el arrastre (dragging)
        if (isDraggingDisabled) {
            map.dragging.disable();
        } else {
            map.dragging.enable();
        }
        
        // Controla el zoom (para evitar zoom out)
        map.options.minZoom = minZoomLevel;
        map.setMaxBounds(map.options.maxBounds); // Refresca los límites si es necesario
        
        return null;
    };


    return (
        <div className="relative w-full h-full">
            {children}
            
            <MapContainer 
                center={currentCenter} 
                zoom={currentZoom} 
                // El minZoom base es 3, pero MapInteractionHandler lo sobrescribirá si hay selección
                minZoom={3} 
                maxZoom={18} 
                scrollWheelZoom={true} 
                className="h-full w-full"
                maxBounds={[
                    [24.396308, -125.0],
                    [49.384358, -66.93457]
                ]}
                maxBoundsViscosity={1.0}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Manejador de interacciones que usa el hook useMap */}
                <MapInteractionHandler 
                    isDraggingDisabled={isDraggingDisabled} 
                    minZoomLevel={minZoomLevel}
                />

                {selectedLocation && (
                    <MapController 
                        center={selectedLocation.center} 
                        zoom={selectedLocation.zoom} 
                    />
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
            </MapContainer>
        </div>
    );
};

=======
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

>>>>>>> cfdb74f750f1a3ce6506c001cfcd65ffb70bee38
export default MapZonas;