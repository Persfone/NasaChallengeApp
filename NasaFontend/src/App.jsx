// src/App.jsx

import { useState, useEffect } from "react";
// Asegúrate de que las rutas relativas son correctas (Ej: './components/NombreComponente')
import { SearchBox } from "/components/SearchBox";
import MapZonas from "/components/MapZone";
import MenuDerecho from "/components/Desplegable";
import "./App.css";
import { fetchAERData, fetchNO2Data, fetchHCHOData, fetchO3Data, fetchSO2Data } from "../components/funcionesFetch";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showTempoUSA, setShowTempoUSA] = useState(false);

  function convertToIntensityPoints(allData) {
    // allData: { airQuality, no2, so2, o3, hcho, aer }
    const airQualityData = allData.airQuality;
    const no2Data = allData.no2;
    const so2Data = allData.so2;
    const o3Data = allData.o3;
    const hchoData = allData.hcho;
    const aerData = allData.aer;
    const points = [];

    // Estándares de la OMS y EPA para clasificar la calidad del aire
    const thresholds = {
      pm25: {
        good: 12,
        moderate: 35.4,
        unhealthy: 55.4,
        veryUnhealthy: 150.4,
        hazardous: 250.4,
      },
      pm10: {
        good: 54,
        moderate: 154,
        unhealthy: 254,
        veryUnhealthy: 354,
        hazardous: 424,
      },
      o3: {
        good: 0.054,
        moderate: 0.07,
        unhealthy: 0.085,
        veryUnhealthy: 0.105,
        hazardous: 0.2,
      },
      no2: {
        good: 53,
        moderate: 100,
        unhealthy: 360,
        veryUnhealthy: 649,
        hazardous: 1249,
      },
      so2: {
        good: 35,
        moderate: 75,
        unhealthy: 185,
        veryUnhealthy: 304,
        hazardous: 604,
      },
      co: {
        good: 4.4,
        moderate: 9.4,
        unhealthy: 12.4,
        veryUnhealthy: 15.4,
        hazardous: 30.4,
      },
      hcho: {
        good: 0.001,
        moderate: 0.002,
        unhealthy: 0.003,
        veryUnhealthy: 0.004,
        hazardous: 0.005,
      },
      aer: {
        good: 0.01,
        moderate: 0.02,
        unhealthy: 0.03,
        veryUnhealthy: 0.04,
        hazardous: 0.05,
      },
    };

    function calculateIntensity(value, parameter) {
      const thresh = thresholds[parameter];
      if (!thresh) return 0.1;
      if (value <= thresh.good) {
        return 0.05 + (value / thresh.good) * 0.15;
      } else if (value <= thresh.moderate) {
        return 0.2 + ((value - thresh.good) / (thresh.moderate - thresh.good)) * 0.2;
      } else if (value <= thresh.unhealthy) {
        return 0.4 + ((value - thresh.moderate) / (thresh.unhealthy - thresh.moderate)) * 0.2;
      } else if (value <= thresh.veryUnhealthy) {
        return 0.6 + ((value - thresh.unhealthy) / (thresh.veryUnhealthy - thresh.unhealthy)) * 0.2;
      } else if (value <= thresh.hazardous) {
        return 0.8 + ((value - thresh.veryUnhealthy) / (thresh.hazardous - thresh.veryUnhealthy)) * 0.15;
      } else {
        return Math.min(0.95 + ((value - thresh.hazardous) / thresh.hazardous) * 0.05, 1.0);
      }
    }

    // Procesar airQualityData.locations si existe
    if (airQualityData && airQualityData.locations) {
      airQualityData.locations.forEach((location) => {
        const measurements = location.measurements;
        let totalIntensity = 0;
        let count = 0;
        Object.keys(measurements).forEach((param) => {
          const measurement = measurements[param];
          if (measurement.available && measurement.latest_value !== null) {
            const intensity = calculateIntensity(measurement.latest_value, param);
            totalIntensity += intensity;
            count++;
          }
        });
        const avgIntensity = count > 0 ? totalIntensity / count : 0.1;
        points.push({
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          intensity: avgIntensity,
          locationName: location.name,
          measurements: measurements,
        });
      });
    }

    // Procesar datos de contaminantes individuales (NO2, SO2, O3, HCHO, AER)
    function addPointsFromArray(arr, param) {
      if (Array.isArray(arr)) {
        arr.forEach((item) => {
          if (item.lat !== undefined && item.lon !== undefined && item.value !== undefined) {
            points.push({
              latitude: item.lat,
              longitude: item.lon,
              intensity: calculateIntensity(item.value, param),
              locationName: param.toUpperCase(),
              measurements: { [param]: { latest_value: item.value } },
            });
          }
        });
      }
    }
    addPointsFromArray(no2Data, 'no2');
    addPointsFromArray(so2Data, 'so2');
    addPointsFromArray(o3Data, 'o3');
    addPointsFromArray(hchoData, 'hcho');
    addPointsFromArray(aerData, 'aer');

    return points;
  }

  useEffect(() => {
    if (!selectedLocation && showTempoUSA) {
      // Cargar TEMPO para todo USA
      const lat_min = 24;
      const lat_max = 50;
      const lon_min = -125;
      const lon_max = -66;
      Promise.all([
        fetchNO2Data(lat_min, lat_max, lon_min, lon_max),
        fetchSO2Data(lat_min, lat_max, lon_min, lon_max),
        fetchO3Data(lat_min, lat_max, lon_min, lon_max),
        fetchHCHOData(lat_min, lat_max, lon_min, lon_max),
        fetchAERData(lat_min, lat_max, lon_min, lon_max)
      ]).then(([no2, so2, o3, hcho, aer]) => {
        const allData = { airQuality: null, no2, so2, o3, hcho, aer };
        const weighted = convertToIntensityPoints(allData, true);
        setHeatmapData(weighted);
      });
    } else if (!selectedLocation && !showTempoUSA) {
      setHeatmapData([]);
    }
  }, [selectedLocation, showTempoUSA]);

  // Determina la clase de posición para SearchBox:
  // Posición inicial: Centrada. Se usa 'items-start' en la clase contenedora
  // y un margen superior grande para centrar verticalmente, evitando solapamiento.
  const searchBoxPosition = selectedLocation
    ? "absolute top-4 left-15" // Posición final (esquina superior izquierda)
    : // Usamos el centrado perfecto.
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"; // Posición inicial (centro)
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
          {console.log('[DEBUG] MapZonas heatmapData prop:', heatmapData)}
          <SearchBox
            onLocationSelect={handleLocationSelect}
            positionClass={searchBoxPosition}
            onAirQualityData={(data) => {
              console.log('[DEBUG] onAirQualityData callback triggered:', data);
              if (data && typeof data.then === 'function') {
                // Es una promesa
                console.log('[DEBUG] onAirQualityData received a Promise');
                data.then((resolvedData) => {
                  console.log('[DEBUG] onAirQualityData resolved:', resolvedData);
                  const weighted = convertToIntensityPoints(resolvedData);
                  console.log('[DEBUG] convertToIntensityPoints result:', weighted);
                  setHeatmapData(weighted);
                  console.log('[DEBUG] setHeatmapData called with:', weighted);
                });
              } else {
                // Es un objeto normal
                console.log('[DEBUG] onAirQualityData received:', data);
                const weighted = convertToIntensityPoints(data);
                console.log('[DEBUG] convertToIntensityPoints result:', weighted);
                setHeatmapData(weighted);
                console.log('[DEBUG] setHeatmapData called with:', weighted);
              }
            }}
          />
        </MapZonas>

        {/* Menú desplegable (solapa) */}
        <MenuDerecho>
          {/* Checkbox para mostrar TEMPO USA */}
          <div className="mb-4 flex items-center space-x-3">
            <input
              type="checkbox"
              id="showTempoUSA"
              checked={showTempoUSA}
              onChange={e => setShowTempoUSA(e.target.checked)}
              className="h-5 w-5 rounded border-gray-400 bg-white appearance-none checked:bg-[#012e46] checked:text-[#012e46] transition duration-200 cursor-pointer focus:ring-2 focus:ring-[#012e46]"
            />
            <label htmlFor="showTempoUSA" className="text-gray-900 text-base cursor-pointer">
              Mostrar Heatmap TEMPO para todo USA
            </label>
          </div>

          {/* Título: El texto es negro por herencia, el acento es celeste */}
          <h3 className="text-xl font-light tracking-wide mb-6 text-[#012e46] border-b border-gray-400 pb-2">
            Filtros de Condiciones Médicas
          </h3>

          {/* Subtítulo de Contexto: Texto negro/oscuro */}
          <p className="text-sm font-medium mb-8 text-gray-800">
            Para darte recomendaciones más personalizadas, por favor, indica
            cuál de estas condiciones aplica para{" "}
            <span className="font-bold underline">ti</span>:
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
              <label
                htmlFor="opcion1"
                className="text-gray-900 text-base cursor-pointer"
              >
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
              <label
                htmlFor="opcion2"
                className="text-gray-900 text-base cursor-pointer"
              >
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
              <label
                htmlFor="opcion3"
                className="text-gray-900 text-base cursor-pointer"
              >
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
              <label
                htmlFor="opcion4"
                className="text-gray-900 text-base cursor-pointer"
              >
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
