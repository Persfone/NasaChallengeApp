// src/App.jsx

import { useState, useEffect } from "react";
import { SearchBox } from "/components/SearchBox";
import MapZonas from "/components/MapZone";
import MenuDerecho from "/components/Desplegable";
import "./App.css";
import { fetchAERData, fetchNO2Data, fetchHCHOData, fetchO3Data, fetchSO2Data } from "../components/funcionesFetch";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showTempoUSA, setShowTempoUSA] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [rawAirQualityData, setRawAirQualityData] = useState(null);

  // ---- FUNCIONES DE INTENSIDAD Y SENSIBILIDAD ----
  function convertToIntensityPoints(allData, medicalConditions = []) {
    const points = [];
    const airQualityData = allData.airQuality;
    const no2Data = allData.no2;
    const so2Data = allData.so2;
    const o3Data = allData.o3;
    const hchoData = allData.hcho;
    const aerData = allData.aer;

    // Estándares base (población general)
    const baseThresholds = {
      pm25: { good: 12, moderate: 35.4, unhealthy: 55.4, veryUnhealthy: 150.4, hazardous: 250.4 },
      pm10: { good: 54, moderate: 154, unhealthy: 254, veryUnhealthy: 354, hazardous: 424 },
      o3: { good: 0.054, moderate: 0.07, unhealthy: 0.085, veryUnhealthy: 0.105, hazardous: 0.2 },
      no2: { good: 53, moderate: 100, unhealthy: 360, veryUnhealthy: 649, hazardous: 1249 },
      so2: { good: 35, moderate: 75, unhealthy: 185, veryUnhealthy: 304, hazardous: 604 },
      co: { good: 4.4, moderate: 9.4, unhealthy: 12.4, veryUnhealthy: 15.4, hazardous: 30.4 },
      hcho: { good: 0.001, moderate: 0.002, unhealthy: 0.003, veryUnhealthy: 0.004, hazardous: 0.005 },
      aer: { good: 0.01, moderate: 0.02, unhealthy: 0.03, veryUnhealthy: 0.04, hazardous: 0.05 },
    };

    // Factores de sensibilidad por condición médica
    const sensitivityFactors = {
      alergias: { pm25: 0.65, pm10: 0.70, o3: 0.70, no2: 0.80, so2: 0.75, co: 1.0 },
      asma: { pm25: 0.50, pm10: 0.55, o3: 0.55, no2: 0.60, so2: 0.55, co: 0.85 },
      epoc: { pm25: 0.45, pm10: 0.50, o3: 0.50, no2: 0.55, so2: 0.50, co: 0.75 },
      hipertension: { pm25: 0.70, pm10: 0.75, o3: 0.80, no2: 0.75, so2: 0.80, co: 0.60 },
    };

    function getCombinedSensitivity(parameter) {
      if (medicalConditions.length === 0) return 1.0;
      let minFactor = 1.0;
      medicalConditions.forEach((condition) => {
        const key = condition.toLowerCase();
        if (sensitivityFactors[key] && sensitivityFactors[key][parameter]) {
          minFactor = Math.min(minFactor, sensitivityFactors[key][parameter]);
        }
      });
      return minFactor;
    }

    function getAdjustedThresholds(parameter) {
      const base = baseThresholds[parameter];
      if (!base) return null;
      const sensitivity = getCombinedSensitivity(parameter);
      return {
        good: base.good * sensitivity,
        moderate: base.moderate * sensitivity,
        unhealthy: base.unhealthy * sensitivity,
        veryUnhealthy: base.veryUnhealthy * sensitivity,
        hazardous: base.hazardous * sensitivity,
      };
    }

    function calculateIntensity(value, parameter) {
      const thresh = getAdjustedThresholds(parameter);
      if (!thresh) return 0.1;
      if (value <= thresh.good) return 0.05 + (value / thresh.good) * 0.15;
      if (value <= thresh.moderate) return 0.2 + ((value - thresh.good) / (thresh.moderate - thresh.good)) * 0.2;
      if (value <= thresh.unhealthy) return 0.4 + ((value - thresh.moderate) / (thresh.unhealthy - thresh.moderate)) * 0.2;
      if (value <= thresh.veryUnhealthy) return 0.6 + ((value - thresh.unhealthy) / (thresh.veryUnhealthy - thresh.unhealthy)) * 0.2;
      if (value <= thresh.hazardous) return 0.8 + ((value - thresh.veryUnhealthy) / (thresh.hazardous - thresh.veryUnhealthy)) * 0.15;
      return Math.min(0.95 + ((value - thresh.hazardous) / thresh.hazardous) * 0.05, 1.0);
    }

    // Procesar airQualityData.locations si existe
    if (airQualityData && airQualityData.locations) {
      airQualityData.locations.forEach((location) => {
        const measurements = location.measurements;
        let maxIntensity = 0;
        let worstPollutant = null;
        Object.keys(measurements).forEach((param) => {
          const measurement = measurements[param];
          if (measurement.available && measurement.latest_value !== null) {
            const intensity = calculateIntensity(measurement.latest_value, param);
            if (intensity > maxIntensity) {
              maxIntensity = intensity;
              worstPollutant = param;
            }
          }
        });
        const finalIntensity = maxIntensity > 0 ? maxIntensity : 0.1;
        points.push({
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          intensity: finalIntensity,
          locationName: location.name,
          measurements: measurements,
          worstPollutant,
        });
      });
    }

    // Procesar datos de contaminantes individuales
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

  // ---- EFECTOS Y HANDLERS ----
  useEffect(() => {
    if (!selectedLocation && showTempoUSA) {
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
        const weighted = convertToIntensityPoints(allData, selectedConditions);
        setHeatmapData(weighted);
      });
    } else if (!selectedLocation && !showTempoUSA) {
      setHeatmapData([]);
    }
  }, [selectedLocation, showTempoUSA, selectedConditions]);

  const handleConditionChange = (condition, isChecked) => {
    setSelectedConditions((prev) => {
      const newConditions = isChecked
        ? [...prev, condition]
        : prev.filter((c) => c !== condition);
      if (rawAirQualityData) {
        const weighted = convertToIntensityPoints(rawAirQualityData, newConditions);
        setHeatmapData(weighted);
      }
      return newConditions;
    });
  };

  const handleApplyFilters = () => {
    if (rawAirQualityData) {
      const weighted = convertToIntensityPoints(rawAirQualityData, selectedConditions);
      setHeatmapData(weighted);
    }
  };

  const searchBoxPosition = selectedLocation
    ? "absolute top-4 left-15"
    : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center";

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const initialCenter = { lat: 39.8283, lng: -98.5795 };
  const initialZoom = 5;

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="w-full h-[100vh] relative">
        <MapZonas
          center={initialCenter}
          zoom={initialZoom}
          selectedLocation={selectedLocation}
          zonas={[]}
          heatmapData={heatmapData}
        >
          <SearchBox
            onLocationSelect={handleLocationSelect}
            positionClass={searchBoxPosition}
            onAirQualityData={(data) => {
              if (data && typeof data.then === "function") {
                data.then((resolvedData) => {
                  setRawAirQualityData(resolvedData);
                  const weighted = convertToIntensityPoints(
                    resolvedData,
                    selectedConditions
                  );
                  setHeatmapData(weighted);
                });
              } else {
                setRawAirQualityData(data);
                const weighted = convertToIntensityPoints(data, selectedConditions);
                setHeatmapData(weighted);
              }
            }}
          />
        </MapZonas>

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

          <h3 className="text-xl font-light tracking-wide mb-6 text-[#012e46] border-b border-gray-400 pb-2">
            Filtros de Condiciones Médicas
          </h3>

          <p className="text-sm font-medium mb-8 text-gray-800">
            Para darte recomendaciones más personalizadas, por favor, indica
            cuál de estas condiciones aplica para{" "}
            <span className="font-bold underline">ti</span>:
          </p>

          <ul className="space-y-4">
            {["alergias", "asma", "hipertension", "epoc"].map((cond) => (
              <li key={cond} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={cond}
                  checked={selectedConditions.includes(cond)}
                  onChange={(e) => handleConditionChange(cond, e.target.checked)}
                  className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                            checked:bg-[#012e46] checked:text-[#012e46]
                            transition duration-200 cursor-pointer
                            focus:ring-2 focus:ring-[#012e46]"
                />
                <label
                  htmlFor={cond}
                  className="text-gray-900 text-base cursor-pointer"
                >
                  {cond.charAt(0).toUpperCase() + cond.slice(1)}
                </label>
              </li>
            ))}
          </ul>

          <button
            onClick={handleApplyFilters}
            className="mt-10 w-full py-2 rounded-lg bg-[#012e46] hover:bg-[#012e46] text-white font-semibold transition-transform duration-150 shadow-lg active:scale-95 active:shadow-md"
          >
            Aplicar Filtros
          </button>

          {selectedConditions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Perfil activo:</span>{" "}
                {selectedConditions.join(", ")}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                El mapa se ajusta para mostrar riesgos específicos a tu condición
              </p>
            </div>
          )}
        </MenuDerecho>
      </div>
    </div>
  );
}

export default App;