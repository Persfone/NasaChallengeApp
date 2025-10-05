// src/components/HeatmapCanvas.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

const HeatmapCanvas = ({ data = [], radius = 120, opacity = 0.9, intensityMultiplier = 1 }) => {
  const map = useMap();
  const overlayRef = useRef(null);
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (!map || !data.length || hasGeneratedRef.current) return;

    hasGeneratedRef.current = true;

    const generateHeatmap = () => {
      console.log(`Generando heatmap con ${data.length} puntos...`);
      console.log("Primeros 3 puntos:", data.slice(0, 3));

      // Filtrar y validar puntos
      const validPoints = data.filter(p => 
        p.latitude && p.longitude && 
        !isNaN(p.latitude) && !isNaN(p.longitude) &&
        p.intensity !== undefined && !isNaN(p.intensity)
      ).map(p => ({
        lat: p.latitude,
        lng: p.longitude,
        intensity: p.intensity
      }));

      if (validPoints.length === 0) {
        console.error("No hay puntos válidos para dibujar");
        return;
      }

      console.log(`Puntos válidos: ${validPoints.length}/${data.length}`);

      // Calcular límites geográficos
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;

      validPoints.forEach(p => {
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
      });

      // Añadir margen del 10%
      const latMargin = Math.max((maxLat - minLat) * 0.1, 0.01);
      const lngMargin = Math.max((maxLng - minLng) * 0.1, 0.01);
      minLat -= latMargin;
      maxLat += latMargin;
      minLng -= lngMargin;
      maxLng += lngMargin;

      console.log(`Bounds: [${minLat.toFixed(4)}, ${minLng.toFixed(4)}] to [${maxLat.toFixed(4)}, ${maxLng.toFixed(4)}]`);

      // Crear canvas
      const canvas = document.createElement("canvas");
      const latRange = maxLat - minLat;
      const lngRange = maxLng - minLng;
      const aspectRatio = lngRange / latRange;
      
      // Para ciudades con pocos sensores, usar mayor resolución
      let width, height;
      if (aspectRatio > 1) {
        width = 2000;
        height = Math.round(2000 / aspectRatio);
      } else {
        height = 2000;
        width = Math.round(2000 * aspectRatio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      console.log(`Canvas: ${width}x${height}px`);
      
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);

      // Escala de colores alineada con umbrales de calidad del aire
      // Colores más saturados y vibrantes para mejor visibilidad
      // 0-0.20: Verde brillante (Bueno)
      // 0.20-0.40: Amarillo intenso (Moderado)
      // 0.40-0.60: Naranja (Insalubre para grupos sensibles)
      // 0.60-0.80: Rojo-naranja (Insalubre)
      // 0.80-1.0: Rojo intenso (Muy insalubre/Peligroso)
      const gradient = d3.scaleLinear()
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1.0])
        .range(['#00ee00', '#ffff00', '#ff9900', '#ff3300', '#dd0000', '#880000'])
        .interpolate(d3.interpolateRgb);
      
      // Conversión de coordenadas
      const latToY = (lat) => Math.floor(((maxLat - lat) / latRange) * height);
      const lngToX = (lng) => Math.floor(((lng - minLng) / lngRange) * width);

      // Convertir puntos a coordenadas de píxel
      const pixelPoints = validPoints.map(p => ({
        x: lngToX(p.lng),
        y: latToY(p.lat),
        intensity: p.intensity
      }));

      // Calcular estadísticas de intensidad
      const intensities = validPoints.map(p => p.intensity);
      intensities.sort((a, b) => a - b);
      const minIntensity = intensities[0];
      const maxIntensity = intensities[intensities.length - 1];
      const p95 = intensities[Math.floor(intensities.length * 0.95)];
      
      console.log(`Intensidades: min=${minIntensity.toFixed(6)}, max=${maxIntensity.toFixed(6)}, p95=${p95.toFixed(6)}`);

      // Buffer para almacenar valores interpolados
      const buffer = new Float32Array(width * height);
      const weights = new Float32Array(width * height);

      console.log("Procesando interpolación IDW (Inverse Distance Weighted)...");

      // Interpolación IDW para pocos puntos
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          let weightedSum = 0;
          let totalWeight = 0;

          // Calcular influencia de cada punto
          for (const point of pixelPoints) {
            const dx = px - point.x;
            const dy = py - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Si estamos muy cerca del punto, usar su valor directamente
            if (dist < 1) {
              weightedSum = point.intensity;
              totalWeight = 1;
              break;
            }

            // Si está dentro del radio de influencia
            if (dist <= radius) {
              // Interpolación más suave para sensores dispersos
              // Falloff más gradual para cubrir más área
              const falloff = 1 - Math.pow(dist / radius, 1.5);
              const weight = Math.pow(falloff, 1.5) / Math.sqrt(dist + 1);
              
              weightedSum += point.intensity * weight;
              totalWeight += weight;
            }
          }

          // Si hay influencia, guardar el valor interpolado
          if (totalWeight > 0) {
            const idx = py * width + px;
            buffer[idx] = weightedSum / totalWeight;
            weights[idx] = 1;
          }
        }

        if (py % 100 === 0) {
          console.log(`Procesado ${((py / height) * 100).toFixed(1)}%...`);
        }
      }

      console.log("Aplicando colores...");

      // Calcular rango de valores interpolados
      const interpolatedValues = [];
      for (let i = 0; i < buffer.length; i++) {
        if (weights[i] > 0 && buffer[i] > 0) {
          interpolatedValues.push(buffer[i]);
        }
      }

      interpolatedValues.sort((a, b) => a - b);
      const interpMin = interpolatedValues[0] || minIntensity;
      const interpMax = interpolatedValues[interpolatedValues.length - 1] || maxIntensity;
      const interpP95 = interpolatedValues[Math.floor(interpolatedValues.length * 0.95)] || interpMax;

      console.log(`Valores interpolados: min=${interpMin.toFixed(6)}, max=${interpMax.toFixed(6)}, p95=${interpP95.toFixed(6)}`);

      const img = ctx.createImageData(width, height);

      for (let i = 0; i < buffer.length; i++) {
        if (weights[i] === 0 || buffer[i] === 0) continue;

        // Usar el valor interpolado directamente (ya está en escala 0-1)
        let norm = buffer[i];
        
        // Clamp entre 0 y 1
        if (norm < 0) norm = 0;
        if (norm > 1) norm = 1;

        // Aplicar multiplicador de intensidad (útil para ajustar sensibilidad)
        norm = norm * intensityMultiplier;
        if (norm > 1) norm = 1;

        const color = d3.color(gradient(norm));
        const idx = i * 4;
        img.data[idx] = color.r;
        img.data[idx + 1] = color.g;
        img.data[idx + 2] = color.b;
        // Opacidad más fuerte, mínimo 150 para que se vea bien
        img.data[idx + 3] = Math.max(150, Math.min(norm * 255 * opacity, 255));
      }

      ctx.putImageData(img, 0, 0);

      // Crear overlay de Leaflet
      const imageUrl = canvas.toDataURL();
      const bounds = L.latLngBounds(
        L.latLng(minLat, minLng),
        L.latLng(maxLat, maxLng)
      );

      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
      }

      overlayRef.current = L.imageOverlay(imageUrl, bounds, {
        opacity: 1,
        interactive: false
      }).addTo(map);

      console.log("¡Heatmap completado!");
    };

    setTimeout(generateHeatmap, 100);

    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [map, data, radius, opacity, intensityMultiplier]);

  return null;
};

export default HeatmapCanvas;