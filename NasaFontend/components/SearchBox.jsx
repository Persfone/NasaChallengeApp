// /components/SearchBox.jsx
import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import {fetchAirQualityInArea, fetchNO2Data, fetchSO2Data, fetchO3Data, fetchHCHOData, fetchAERData} from './funcionesFetch';

export const SearchBox = ({ onLocationSelect, positionClass, onAirQualityData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef(null);
    
    // Cambiamos el glassEffect para mejorar el contraste
    const glassEffect = "bg-black/20 backdrop-blur-md border border-[#012e46]"; 
    const shadowStyle = "shadow-2xl shadow-gray-900/50";

    // ... (handleSearch, handleInputChange, handleSelectLocation, handleClearSearch - Lógica se mantiene) ...
    const handleSearch = async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      setIsSearching(true);
      
      try {
        // Fetch directo a Nominatim (sin proxy)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5&email=guido@example.com`);
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
  
    const handleSelectLocation = async (result) => {
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      console.log('Ubicación seleccionada:', lat, lng, result.display_name);
      const corners = getMapCorners([lat, lng], 12);
      console.log('Esquina Noreste:', corners.noreste);
      console.log('Esquina Suroeste:', corners.suroeste);
      const bbox = `${corners.suroeste[1].toFixed(3)},${corners.suroeste[0].toFixed(3)},${corners.noreste[1].toFixed(3)},${corners.noreste[0].toFixed(3)}`;
      // Calcular los límites para los endpoints de contaminantes
      const lat_min = Math.min(corners.suroeste[0], corners.noreste[0]);
      const lat_max = Math.max(corners.suroeste[0], corners.noreste[0]);
      const lon_min = Math.min(corners.suroeste[1], corners.noreste[1]);
      const lon_max = Math.max(corners.suroeste[1], corners.noreste[1]);
      // Fetch de todos los endpoints
      const airQualityPromise = fetchAirQualityInArea(bbox, 50, 'distributed');
      const no2Promise = fetchNO2Data(parseInt(lat_min), parseInt(lat_max), parseInt(lon_min), parseInt(lon_max));
      const so2Promise = fetchSO2Data(parseInt(lat_min), parseInt(lat_max), parseInt(lon_min), parseInt(lon_max));
      const o3Promise = fetchO3Data(parseInt(lat_min), parseInt(lat_max), parseInt(lon_min), parseInt(lon_max));
      const hchoPromise = fetchHCHOData(parseInt(lat_min), parseInt(lat_max), parseInt(lon_min), parseInt(lon_max));
      const aerPromise = fetchAERData(parseInt(lat_min), parseInt(lat_max), parseInt(lon_min), parseInt(lon_max));
      // Esperar todos los datos
      const allDataPromise = Promise.all([
        airQualityPromise,
        no2Promise,
        so2Promise,
        o3Promise,
        hchoPromise,
        aerPromise
      ]).then(([airQuality, no2, so2, o3, hcho, aer]) => ({
        airQuality,
        no2,
        so2,
        o3,
        hcho,
        aer
      }));
      if (onAirQualityData) {
        onAirQualityData(allDataPromise);
      }
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
    function getMapCorners(center, zoom, mapWidthPx = 800, mapHeightPx = 600) {
        // Crea un mapa temporal en memoria
        const map = L.map(document.createElement('div'), {
            center,
            zoom,
            zoomControl: false,
            attributionControl: false,
            interactive: false,
        });
        map.setView(center, zoom);

        // Simula el tamaño del mapa
        map._size = L.point(mapWidthPx, mapHeightPx);

        // Obtiene los bounds
        const bounds = map.getBounds();
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const nw = L.latLng(bounds.getNorth(), bounds.getWest());
        const se = L.latLng(bounds.getSouth(), bounds.getEast());

        return {
            noreste: [ne.lat, ne.lng],
            noroeste: [nw.lat, nw.lng],
            sureste: [se.lat, se.lng],
            suroeste: [sw.lat, sw.lng],
        };
    }

    // La barra de búsqueda con su contenedor y texto de guía
    const SearchBarContent = (
      <div className={`w-80 transition-all duration-500 left-5`}>
          <div className={`rounded-lg ${glassEffect} ${shadowStyle}`}>
              <div className="relative">
                  <div className="absolute top-11  -translate-x-1/2 -translate-y-[150%] flex flex-col text-[#012e46] items-centerabsolute left-6 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <Search size={20} />
                  </div>
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={handleInputChange}
                      placeholder="Buscar ciudad o lugar en USA..."

                      className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-[#012e46] focus:outline-none bg-transparent text-[#012e46] placeholder-text-[#012e46]"
                  />
                  {searchQuery && (
                      <button
                          onClick={handleClearSearch}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#012e46] hover:text-[#012e46]"
                      >
                          <X size={20} />
                      </button>
                  )}
              </div>

              {showResults && (
                  // Resultados con un fondo más sólido para mejor legibilidad
                  <div className="mt-2 max-h-64 overflow-y-auto rounded-lg shadow-lg border border-[#012e46] bg-white backdrop-blur-md">
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
                <div className={`mt-4 w-80 p-4 rounded-lg text-center text-[#012e46] font-semibold ${glassEffect}`}>
                    <p className="text-lg text-[#012e46]">
                        Busca la región/ciudad que necesites para saber la pureza del aire
                    </p>
                    <p className="text-sm mt-2 font-normal text-[#012e46]">
                        Una vez selecciones una ubicación, el mapa se fijará en esa zona.
                    </p>
                </div>
            )}
        </div>
    );
};