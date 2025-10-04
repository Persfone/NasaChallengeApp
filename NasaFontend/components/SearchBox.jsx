// /components/SearchBox.jsx
import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBox = ({ onLocationSelect, positionClass }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef(null);
    
    // Cambiamos el glassEffect para mejorar el contraste
    const glassEffect = "bg-black/20 backdrop-blur-md border border-white/50"; 
    const shadowStyle = "shadow-2xl shadow-gray-900/50";

    // ... (handleSearch, handleInputChange, handleSelectLocation, handleClearSearch - Lógica se mantiene igual) ...
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
        zoom: 12, // Zoom fijado
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

    // La barra de búsqueda con su contenedor y texto de guía
    const SearchBarContent = (
      <div className={`w-80 transition-all duration-500`}>
          <div className={`rounded-lg ${glassEffect} ${shadowStyle}`}>
              <div className="relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] flex flex-col items-centerabsolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <Search size={20} />
                  </div>
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={handleInputChange}
                      placeholder="Buscar ciudad o lugar en USA..."
                      // Texto e iconos en blanco para mejor contraste
                      className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-white/70 focus:outline-none bg-transparent text-white placeholder-white/70"
                  />
                  {searchQuery && (
                      <button
                          onClick={handleClearSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white/80"
                      >
                          <X size={20} />
                      </button>
                  )}
              </div>

              {showResults && (
                  // Resultados con un fondo más sólido para mejor legibilidad
                  <div className="mt-2 max-h-64 overflow-y-auto rounded-lg shadow-lg border border-white/40 bg-white backdrop-blur-md">
                      {isSearching ? (
                          <div className="p-4 text-center text-[#012e46]">Buscando...</div>
                      ) : searchResults.length > 0 ? (
                          <ul>
                              {searchResults.map((result, idx) => (
                                  <li
                                      key={idx}
                                      onClick={() => handleSelectLocation(result)}
                                      className="p-3 hover:bg-blue-50 cursor-pointer"
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
                          <div className="p-4 text-center text-[#012e46]">No se encontraron resultados</div>
                      )}
                  </div>
              )}
          </div>
      </div>
    );


    // Renderizado principal
    return (
        <div className={`z-[1000] transition-all duration-500 ${positionClass}`}>
            {SearchBarContent}
            
            {/* TEXTO PROFESIONAL DE GUÍA SOLO VISIBLE EN POSICIÓN CENTRADA */}
            {positionClass.includes('translate-x-1/2') && (
                <div className={`mt-4 w-80 p-4 rounded-lg text-center text-white font-semibold ${glassEffect}`}>
                    <p className="text-lg text-white">
                        🗺️ **Busca la región/ciudad que necesites para saber la pureza del aire** 🌬️
                    </p>
                    <p className="text-sm mt-2 font-normal text-white/80">
                        Una vez selecciones una ubicación, el mapa se fijará en esa zona.
                    </p>
                </div>
            )}
        </div>
    );
};