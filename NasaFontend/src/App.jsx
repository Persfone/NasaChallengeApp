// src/App.jsx

import { useState, useEffect } from 'react';
// Asegúrate de que las rutas relativas son correctas (Ej: './components/NombreComponente')
import { SearchBox } from '/components/SearchBox'; 
import MapZonas from '/components/MapZone'; 
import MenuDerecho from '/components/Desplegable'; 
import './App.css';

function App() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);

    useEffect(() => {
        fetch('/json/heatmap_data.json')
            .then(response => response.json())
            .then(data => {
                setHeatmapData(data);
                console.log(data); // 👈 Aquí sí funciona
            })
            .catch(error => {
                console.error('Error al cargar heatmap_data:', error);
                setHeatmapData([]);
            });
    }, []);

    // Determina la clase de posición para SearchBox:
    // Posición inicial: Centrada. Se usa 'items-start' en la clase contenedora 
    // y un margen superior grande para centrar verticalmente, evitando solapamiento.
    const searchBoxPosition = selectedLocation
      ? "absolute top-4 left-15" // Posición final (esquina superior izquierda)
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
                  zonas={[]}
                  heatmapData={heatmapData} // 👈 aquí pasamos los puntos
                >
                  <SearchBox 
                        onLocationSelect={handleLocationSelect} 
                        positionClass={searchBoxPosition}
                    />
                </MapZonas>


                {/* Menú desplegable (solapa) */}
                <MenuDerecho>

                  {/* Título: El texto es negro por herencia, el acento es celeste */}
                  <h3 className="text-xl font-light tracking-wide mb-6 text-[#012e46] border-b border-gray-400 pb-2">
                    Filtros de Condiciones Médicas
                  </h3>

                  {/* Subtítulo de Contexto: Texto negro/oscuro */}
                  <p className="text-sm font-medium mb-8 text-gray-800">
                    Para darte recomendaciones más personalizadas, por favor, indica cuál de estas condiciones aplica para <span className="font-bold underline">ti</span>:
                  </p>

                  {/* Lista con casillas (Checkboxes) */}
                  <ul className="space-y-4">

                    {/* Item 1: Alergias respiratorias */}
                    <li className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="opcion1"
                        className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                                  checked:bg-[#012e46] checked:text-[#012e46]
                                  transition duration-200 cursor-pointer
                                  focus:ring-2 focus:ring-[#012e46]"
                      />
                      <label htmlFor="opcion1" className="text-gray-900 text-base cursor-pointer">
                        Alergias respiratorias
                      </label>
                    </li>

                    {/* Item 2: Asma */}
                    <li className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="opcion2"
                        className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                                  checked:bg-[#012e46] checked:text-[#012e46]
                                  transition duration-200 cursor-pointer
                                  focus:ring-2 focus:ring-[#012e46]"
                      />
                      <label htmlFor="opcion2" className="text-gray-900 text-base cursor-pointer">
                        Asma
                      </label>
                    </li>

                    {/* Item 3: Hipertensión */}
                    <li className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="opcion3"
                        className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                                  checked:bg-[#012e46] checked:text-[#012e46]
                                  transition duration-200 cursor-pointer
                                  focus:ring-2 focus:ring-[#012e46]"
                      />
                      <label htmlFor="opcion3" className="text-gray-900 text-base cursor-pointer">
                        Hipertensión
                      </label>
                    </li>

                    {/* Item 4: EPOC */}
                    <li className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="opcion4"
                        className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                                  checked:bg-[#012e46] checked:text-[#012e46]
                                  transition duration-200 cursor-pointer
                                  focus:ring-2 focus:ring-[#012e46]"
                      />
                      <label htmlFor="opcion4" className="text-gray-900 text-base cursor-pointer">
                        EPOC
                      </label>
                    </li>

                  </ul>

                  {/* Botón de Aplicar Filtros: Contraste con el fondo */}
                  <button className="mt-10 w-full py-2 rounded-lg bg-[#012e46] hover:bg-[#012e46] text-white font-semibold transition-transform duration-150 shadow-lg active:scale-95 active:shadow-md">
                    Aplicar Filtros
                  </button>


                </MenuDerecho>

            </div>
        </div>
    );
}

export default App;