import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

// Componente de búsqueda modular
export const SearchBox = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const glassEffect = "bg-white/15 backdrop-blur-sm border border-white/40";
  const shadowStyle = "shadow-2xl shadow-gray-700/50"; 

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error buscando:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  const handleSelectLocation = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    onLocationSelect({
      center: [lat, lng],
      zoom: 12,
      name: result.display_name
    });
    
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onLocationSelect(null);
  };

  return (
  <div className="absolute top-4 left-15 z-[1000] w-80">
    <div className={`rounded-lg ${glassEffect} ${shadowStyle}`}>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#012e46]">
                {/* El icono de búsqueda siempre visible */}
                <Search size={20} />
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Buscar ciudad o lugar en USA..."
                className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-[#012e46] focus:outline-none bg-white/30 text-[#012e46] placeholder-[#012e46]"
            />
            {searchQuery && (
                <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#012e46] hover:text-[#012e46]"
                >
                    {/* El icono de borrar (X) usando un color de texto que contraste */}
                    <X size={20} />
                </button>
            )}
        </div>

        {showResults && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-lg bg-white/30 backdrop-blur-md">
                {isSearching ? (
                    <div className="p-4 text-center text-[#012e46]">
                        Buscando...
                    </div>
                ) : searchResults.length > 0 ? (
                     <ul>
                        {searchResults.map((result, idx) => (
                            <li
                                key={idx}
                                onClick={() => handleSelectLocation(result)}
                                className="p-3 hover:bg-white/50 cursor-pointer"
                            >
                                <div className="text-sm font-medium text-gray-900"> 
                                    {result.display_name.split(',')[0]}
                                </div>
                                <div className="text-xs text-[#012e46] mt-1">
                                    {result.display_name}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center text-[#012e46]">
                        No se encontraron resultados
                    </div>
                )}
            </div>
        )}
    </div>
</div>
  );
};

// Componente MapZonas limpio
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";

const MapController = ({ center, zoom }) => {
  const map = useMap();
  
  if (center && zoom) {
    map.setView(center, zoom);
  }
  
  return null;
};

const MapZonas = ({ zonas, center, zoom = 13, selectedLocation, children }) => {
  return (
    <div className="relative w-full h-full">
      {children}
      
      <MapContainer 
        center={center} 
        zoom={zoom} 
        minZoom={3} 
        maxZoom={18} 
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

export default MapZonas;