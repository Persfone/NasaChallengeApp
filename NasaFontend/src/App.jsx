// src/App.jsx

import { useState } from 'react';
// Asegúrate de que las rutas relativas son correctas (Ej: './components/NombreComponente')
import { SearchBox } from '/components/SearchBox'; 
import MapZonas from '/components/MapZone'; 
import MenuDerecho from '/components/Desplegable'; 
import './App.css';

function App() {
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Determina la clase de posición para SearchBox:
    // Posición inicial: Centrada. Se usa 'items-start' en la clase contenedora 
    // y un margen superior grande para centrar verticalmente, evitando solapamiento.
    const searchBoxPosition = selectedLocation
      ? "absolute top-4 left-4" // Posición final (esquina superior izquierda)
      // Usamos el centrado perfecto.
      : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"; // Posición inicial (centro)
    const handleLocationSelect = (location) => {
      setSelectedLocation(location);
    };

    const initialCenter = { lat: 39.8283, lng: -98.5795 };
    const initialZoom = 5;

    return (
        <div className="w-full h-full overflow-hidden">
            <div className="w-full h-[100vh] relative">
                
                {/* Mapa */}
                <MapZonas
                    center={initialCenter}
                    zoom={initialZoom}
                    selectedLocation={selectedLocation}
                    zonas={[/* tus zonas */]} 
                >
                    {/* Componente SearchBox inyectado */}
                    <SearchBox 
                        onLocationSelect={handleLocationSelect} 
                        positionClass={searchBoxPosition}
                    />
                </MapZonas>

                {/* ... (MenuDerecho y su contenido se mantienen igual) ... */}
            </div>
        </div>
    );
}

export default App;