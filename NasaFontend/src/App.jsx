import { useState } from 'react'
import MapZonas, { SearchBox } from '/components/MapZone'
import MenuDerecho from '/components/Desplegable'
import './App.css'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const zonas = [
    {
      name: "Zona Verde",
      coords: [
        { lat: -34.60, lng: -58.38 },
        { lat: -34.61, lng: -58.39 },
        { lat: -34.62, lng: -58.37 },
      ],
      color: "green",
    },
    {
      name: "Zona Amarilla",
      coords: [
        { lat: -34.61, lng: -58.40 },
        { lat: -34.62, lng: -58.41 },
        { lat: -34.63, lng: -58.39 },
      ],
      color: "yellow",
    },
    {
      name: "Zona Roja",
      coords: [
        { lat: -34.64, lng: -58.38 },
        { lat: -34.65, lng: -58.39 },
        { lat: -34.66, lng: -58.37 },
      ],
      color: "red",
    },
  ];

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="w-full h-[100vh] relative">
        
        {/* Mapa */}
        <MapZonas
          center={{ lat: 39.8283, lng: -98.5795 }}
          zoom={5}
          selectedLocation={selectedLocation}
          zonas={zonas}
        >
          <SearchBox onLocationSelect={setSelectedLocation} />
        </MapZonas>

        {/* Menú desplegable (solapa) */}
        <MenuDerecho zonas={zonas}>
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
                id="opcion3"
                className="h-5 w-5 rounded border-gray-400 bg-white appearance-none 
                          checked:bg-[#012e46] checked:text-[#012e46]
                          transition duration-200 cursor-pointer 
                          focus:ring-2 focus:ring-[#012e46]"
              />
              <label htmlFor="opcion3" className="text-gray-900 text-base cursor-pointer">
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
          <button className="mt-10 w-full py-2 rounded-lg bg-[#012e46] hover:bg-bg-[#012e46] text-white font-semibold transition duration-300 shadow-lg">
            Aplicar Filtros
          </button>
        </MenuDerecho>
      </div>
    </div>
  )
}

export default App
