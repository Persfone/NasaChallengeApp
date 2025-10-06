// src/App.jsx

import { useState, useEffect } from "react";
import { SearchBox } from "/components/SearchBox";
import MapZonas from "/components/MapZone";
import MenuDerecho from "/components/Desplegable";
import "./App.css";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [rawAirQualityData, setRawAirQualityData] = useState(null);

  function convertToIntensityPoints(airQualityData, medicalConditions = []) {
    const points = [];

    // Estándares base (población general)
    const baseThresholds = {
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
    };

    // Factores de sensibilidad por condición médica
    // Basados en evidencia médica - valores más conservadores para protección
    const sensitivityFactors = {
      alergias: {
        pm25: 0.65,  // Muy sensibles a partículas finas (polen, polvo)
        pm10: 0.70,  // Sensibles a partículas gruesas
        o3: 0.70,    // Ozono irrita mucosas
        no2: 0.80,   // Irritante respiratorio
        so2: 0.75,   // Irritante de vías aéreas
        co: 1.0,     // Sin sensibilidad especial documentada
      },
      asma: {
        pm25: 0.50,  // CRÍTICO: Principal desencadenante de crisis
        pm10: 0.55,  // Muy sensibles
        o3: 0.55,    // CRÍTICO: Broncoconstrictor severo
        no2: 0.60,   // Inflamación de vías respiratorias
        so2: 0.55,   // CRÍTICO: Broncoconstrictor inmediato
        co: 0.85,    // Reduce capacidad de transporte de oxígeno
      },
      epoc: {
        pm25: 0.45,  // CRÍTICO: Alta morbimortalidad documentada
        pm10: 0.50,  // Exacerbaciones agudas
        o3: 0.50,    // CRÍTICO: Inflamación pulmonar severa
        no2: 0.55,   // Daño bronquial acumulativo
        so2: 0.50,   // CRÍTICO: Broncoconstricción en pulmones dañados
        co: 0.75,    // Hipoxemia en capacidad ya reducida
      },
      hipertension: {
        pm25: 0.70,  // Eventos cardiovasculares agudos (infartos, ACV)
        pm10: 0.75,  // Aumento documentado de presión arterial
        o3: 0.80,    // Estrés oxidativo vascular
        no2: 0.75,   // Disfunción endotelial
        so2: 0.80,   // Vasoconstricción
        co: 0.60,    // CRÍTICO: Hipoxia tisular, aumenta carga cardíaca
      },
    };

    // Calcular el factor de sensibilidad combinado
    function getCombinedSensitivity(parameter) {
      if (medicalConditions.length === 0) {
        return 1.0;
      }

      let minFactor = 1.0;
      medicalConditions.forEach((condition) => {
        const conditionKey = condition.toLowerCase();
        if (
          sensitivityFactors[conditionKey] &&
          sensitivityFactors[conditionKey][parameter]
        ) {
          minFactor = Math.min(
            minFactor,
            sensitivityFactors[conditionKey][parameter]
          );
        }
      });

      return minFactor;
    }

    // Ajustar umbrales según condiciones médicas
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

    // Función para calcular la intensidad
    function calculateIntensity(value, parameter) {
      const thresh = getAdjustedThresholds(parameter);
      if (!thresh) return 0.1;

      if (value <= thresh.good) {
        return 0.05 + (value / thresh.good) * 0.15;
      } else if (value <= thresh.moderate) {
        return (
          0.2 + ((value - thresh.good) / (thresh.moderate - thresh.good)) * 0.2
        );
      } else if (value <= thresh.unhealthy) {
        return (
          0.4 +
          ((value - thresh.moderate) / (thresh.unhealthy - thresh.moderate)) *
            0.2
        );
      } else if (value <= thresh.veryUnhealthy) {
        return (
          0.6 +
          ((value - thresh.unhealthy) /
            (thresh.veryUnhealthy - thresh.unhealthy)) *
            0.2
        );
      } else if (value <= thresh.hazardous) {
        return (
          0.8 +
          ((value - thresh.veryUnhealthy) /
            (thresh.hazardous - thresh.veryUnhealthy)) *
            0.15
        );
      } else {
        return Math.min(
          0.95 + ((value - thresh.hazardous) / thresh.hazardous) * 0.05,
          1.0
        );
      }
    }

    // Procesar cada ubicación
    airQualityData.locations.forEach((location) => {
      const measurements = location.measurements;
      let maxIntensity = 0; // Usar el MÁXIMO en lugar de promedio
      let worstPollutant = null;

      Object.keys(measurements).forEach((param) => {
        const measurement = measurements[param];
        if (measurement.available && measurement.latest_value !== null) {
          const intensity = calculateIntensity(measurement.latest_value, param);
          
          // Tomar el peor caso (máximo riesgo)
          if (intensity > maxIntensity) {
            maxIntensity = intensity;
            worstPollutant = param;
          }
        }
      });

      // Si no hay mediciones válidas, usar valor por defecto conservador
      const finalIntensity = maxIntensity > 0 ? maxIntensity : 0.1;

      points.push({
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        intensity: finalIntensity,
        locationName: location.name,
        measurements: measurements,
        worstPollutant: worstPollutant, // Para debugging/info
      });
    });

    return points;
  }

  // Manejar cambios en checkboxes
  const handleConditionChange = (condition, isChecked) => {
    setSelectedConditions((prev) => {
      const newConditions = isChecked
        ? [...prev, condition]
        : prev.filter((c) => c !== condition);
      
      console.log("[DEBUG] Condiciones seleccionadas:", newConditions);
      
      // Recalcular heatmap si ya tenemos datos
      if (rawAirQualityData) {
        const weighted = convertToIntensityPoints(rawAirQualityData, newConditions);
        setHeatmapData(weighted);
        console.log("[DEBUG] Heatmap recalculado con nuevas condiciones");
      }
      
      return newConditions;
    });
  };

  // Aplicar filtros manualmente
  const handleApplyFilters = () => {
    if (rawAirQualityData) {
      const weighted = convertToIntensityPoints(rawAirQualityData, selectedConditions);
      setHeatmapData(weighted);
      console.log("[DEBUG] Filtros aplicados:", selectedConditions);
    }
  };

  useEffect(() => {}, []);

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
          {console.log("[DEBUG] MapZonas heatmapData prop:", heatmapData)}
          <SearchBox
            onLocationSelect={handleLocationSelect}
            positionClass={searchBoxPosition}
            onAirQualityData={(data) => {
              console.log("[DEBUG] onAirQualityData callback triggered:", data);
              if (data && typeof data.then === "function") {
                data.then((resolvedData) => {
                  console.log("[DEBUG] onAirQualityData resolved:", resolvedData);
                  setRawAirQualityData(resolvedData);
                  const weighted = convertToIntensityPoints(
                    resolvedData,
                    selectedConditions
                  );
                  console.log("[DEBUG] convertToIntensityPoints result:", weighted);
                  setHeatmapData(weighted);
                  console.log("[DEBUG] setHeatmapData called with:", weighted);
                });
              } else {
                console.log("[DEBUG] onAirQualityData received:", data);
                setRawAirQualityData(data);
                const weighted = convertToIntensityPoints(data, selectedConditions);
                console.log("[DEBUG] convertToIntensityPoints result:", weighted);
                setHeatmapData(weighted);
                console.log("[DEBUG] setHeatmapData called with:", weighted);
              }
            }}
          />
        </MapZonas>

        <MenuDerecho>
          <h3 className="text-xl font-light tracking-wide mb-6 text-[#012e46] border-b border-gray-400 pb-2">
            Filtros de Condiciones Médicas
          </h3>

          <p className="text-sm font-medium mb-8 text-gray-800">
            Para darte recomendaciones más personalizadas, por favor, indica
            cuál de estas condiciones aplica para{" "}
            <span className="font-bold underline">ti</span>:
          </p>

          <ul className="space-y-4">
            <li className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="alergias"
                checked={selectedConditions.includes("alergias")}
                onChange={(e) =>
                  handleConditionChange("alergias", e.target.checked)
                }
                className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                          checked:bg-[#012e46] checked:text-[#012e46]
                          transition duration-200 cursor-pointer
                          focus:ring-2 focus:ring-[#012e46]"
              />
              <label
                htmlFor="alergias"
                className="text-gray-900 text-base cursor-pointer"
              >
                Alergias respiratorias
              </label>
            </li>

            <li className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="asma"
                checked={selectedConditions.includes("asma")}
                onChange={(e) => handleConditionChange("asma", e.target.checked)}
                className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                          checked:bg-[#012e46] checked:text-[#012e46]
                          transition duration-200 cursor-pointer
                          focus:ring-2 focus:ring-[#012e46]"
              />
              <label
                htmlFor="asma"
                className="text-gray-900 text-base cursor-pointer"
              >
                Asma
              </label>
            </li>

            <li className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="hipertension"
                checked={selectedConditions.includes("hipertension")}
                onChange={(e) =>
                  handleConditionChange("hipertension", e.target.checked)
                }
                className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                          checked:bg-[#012e46] checked:text-[#012e46]
                          transition duration-200 cursor-pointer
                          focus:ring-2 focus:ring-[#012e46]"
              />
              <label
                htmlFor="hipertension"
                className="text-gray-900 text-base cursor-pointer"
              >
                Hipertensión
              </label>
            </li>

            <li className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="epoc"
                checked={selectedConditions.includes("epoc")}
                onChange={(e) => handleConditionChange("epoc", e.target.checked)}
                className="h-5 w-5 rounded border-gray-400 bg-white appearance-none
                          checked:bg-[#012e46] checked:text-[#012e46]
                          transition duration-200 cursor-pointer
                          focus:ring-2 focus:ring-[#012e46]"
              />
              <label
                htmlFor="epoc"
                className="text-gray-900 text-base cursor-pointer"
              >
                EPOC
              </label>
            </li>
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