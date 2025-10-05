// src/components/HeatmapCanvas.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

const HeatmapCanvas = ({ data = [], radius = 30, opacity = 0.8 , intensityMultiplier = 0.5}) => {
  const map = useMap();
  const overlayRef = useRef(null);
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (!map || !data.length || hasGeneratedRef.current) return;

    hasGeneratedRef.current = true;

    const generateHeatmap = () => {
      console.log(`Generando heatmap con ${data.length} puntos...`);
      console.log("Primeros 3 puntos:", data.slice(0, 3));

      // Calcular límites geográficos de los datos
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;
      let validPoints = 0;

      data.forEach(p => {
        // Verificar que las coordenadas existan y sean válidas
        if (!p.latitude || !p.longitude || 
            isNaN(p.latitude) || isNaN(p.longitude)) {
          return;
        }
        
        validPoints++;
        if (p.latitude < minLat) minLat = p.latitude;
        if (p.latitude > maxLat) maxLat = p.latitude;
        if (p.longitude < minLng) minLng = p.longitude;
        if (p.longitude > maxLng) maxLng = p.longitude;
      });

      console.log(`Puntos válidos: ${validPoints}/${data.length}`);

      console.log(`Puntos válidos: ${validPoints}/${data.length}`);

      if (validPoints === 0) {
        console.error("No hay puntos válidos para dibujar");
        return;
      }

      // Añadir margen mínimo o 5% del rango
      const latMargin = Math.max((maxLat - minLat) * 0.05, 0.5);
      const lngMargin = Math.max((maxLng - minLng) * 0.05, 0.5);
      minLat -= latMargin;
      maxLat += latMargin;
      minLng -= lngMargin;
      maxLng += lngMargin;

      console.log(`Bounds: [${minLat.toFixed(2)}, ${minLng.toFixed(2)}] to [${maxLat.toFixed(2)}, ${maxLng.toFixed(2)}]`);
      console.log(`Área: ${(maxLat - minLat).toFixed(2)}° lat x ${(maxLng - minLng).toFixed(2)}° lng`);

      // Crear canvas con resolución proporcional al área
      const canvas = document.createElement("canvas");
      const latRange = maxLat - minLat;
      const lngRange = maxLng - minLng;
      const aspectRatio = lngRange / latRange;
      
      let width, height;
      if (aspectRatio > 1) {
        // Más ancho que alto
        width = 3000;
        height = Math.round(3000 / aspectRatio);
      } else {
        // Más alto que ancho
        height = 3000;
        width = Math.round(3000 * aspectRatio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      console.log(`Canvas: ${width}x${height}px`);
      
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);

      // Escala de colores personalizada: Verde -> Amarillo -> Naranja suave -> Rojo suave
      const gradient = d3.scaleLinear()
        .domain([0, 0.33, 0.66, 1])
        .range(['#00ff00', '#ffff00', '#ff9933', '#ff6666'])
        .interpolate(d3.interpolateRgb);
      
      const buffer = new Float32Array(width * height);

      // Función para convertir lat/lng a coordenadas del canvas
      const latToY = (lat) => {
        return Math.floor(((maxLat - lat) / (maxLat - minLat)) * height);
      };
      const lngToX = (lng) => {
        return Math.floor(((lng - minLng) / (maxLng - minLng)) * width);
      };

      // Procesar puntos en lotes para no bloquear la UI
      const batchSize = 5000;
      let processed = 0;

      const processBatch = () => {
        const end = Math.min(processed + batchSize, data.length);
        
        for (let i = processed; i < end; i++) {
          const p = data[i];
          if (!p.latitude || !p.longitude) continue;

          const x = lngToX(p.longitude);
          const y = latToY(p.latitude);
          const intensity = (p.intensity || 1) * 10; // Multiplicador de intensidad
          const r = radius;
          const r2 = r * r;

          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const dist2 = dx * dx + dy * dy;
              if (dist2 > r2) continue;

              const xx = x + dx;
              const yy = y + dy;

              if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;

              const weight = Math.exp(-dist2 / (2 * r2)) * intensity;
              buffer[yy * width + xx] += weight;
            }
          }
        }

        processed = end;

        if (processed < data.length) {
          console.log(`Procesado ${processed}/${data.length} puntos...`);
          setTimeout(processBatch, 0);
        } else {
          finishHeatmap();
        }
      };

      const finishHeatmap = () => {
        console.log("Aplicando colores...");

        // Encontrar máximo y calcular percentil para evitar outliers
        const nonZeroValues = [];
        for (let i = 0; i < buffer.length; i++) {
          if (buffer[i] > 0) nonZeroValues.push(buffer[i]);
        }
        
        nonZeroValues.sort((a, b) => a - b);
        
        // Usar percentil 98 en lugar de 95 para menos saturación
        const percentile98Index = Math.floor(nonZeroValues.length * 0.98);
        const max = nonZeroValues[percentile98Index] || nonZeroValues[nonZeroValues.length - 1] || 1;
        
        console.log(`Valores: min=${nonZeroValues[0]?.toFixed(4)}, max=${nonZeroValues[nonZeroValues.length-1]?.toFixed(4)}, p98=${max.toFixed(4)}`);

        const img = ctx.createImageData(width, height);

        for (let i = 0; i < buffer.length; i++) {
          let norm = buffer[i] / max;
          if (norm === 0) continue;
          
          // Clamp a 1 para valores extremos
          if (norm > 1) norm = 1;
          
          // Aplicar curva logarítmica para mejor distribución de colores
          // Valores bajos se ven mejor, valores altos no saturan tanto
          norm = Math.log(1 + norm * 9) / Math.log(10); // log10(1 + 9*norm)

          const color = d3.color(gradient(norm));
          const idx = i * 4;
          img.data[idx] = color.r;
          img.data[idx + 1] = color.g;
          img.data[idx + 2] = color.b;
          img.data[idx + 3] = Math.min(norm * 255 * opacity, 255);
        }

        ctx.putImageData(img, 0, 0);

        // Crear ImageOverlay de Leaflet
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

      processBatch();
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