// src/components/HeatmapCanvas.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import * as d3 from "d3";

const HeatmapCanvas = ({ data = [], radius = 30, opacity = 0.8, intensityMultiplier = 0.5 }) => {
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

      if (validPoints === 0) {
        console.error("No hay puntos válidos para dibujar");
        return;
      }

      // Añadir margen
      const latMargin = Math.max((maxLat - minLat) * 0.05, 0.5);
      const lngMargin = Math.max((maxLng - minLng) * 0.05, 0.5);
      minLat -= latMargin;
      maxLat += latMargin;
      minLng -= lngMargin;
      maxLng += lngMargin;

      console.log(`Bounds: [${minLat.toFixed(2)}, ${minLng.toFixed(2)}] to [${maxLat.toFixed(2)}, ${maxLng.toFixed(2)}]`);

      // Crear canvas con resolución proporcional al área
      const canvas = document.createElement("canvas");
      const latRange = maxLat - minLat;
      const lngRange = maxLng - minLng;
      const aspectRatio = lngRange / latRange;
      
      let width, height;
      if (aspectRatio > 1) {
        width = 3000;
        height = Math.round(3000 / aspectRatio);
      } else {
        height = 3000;
        width = Math.round(3000 * aspectRatio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      console.log(`Canvas: ${width}x${height}px`);
      
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);

      // Escala de colores más exigente: 
      // Verde (valores muy bajos) -> Amarillo (bajos) -> Naranja (medios) -> Rojo (altos)
      const gradient = d3.scaleLinear()
        .domain([0, 0.4, 0.7, 1])
        .range(['#00ff00', '#ffff00', '#ff8800', '#cc0000'])
        .interpolate(d3.interpolateRgb);
      
      // Función para convertir lat/lng a coordenadas del canvas
      const latToY = (lat) => {
        return Math.floor(((maxLat - lat) / (maxLat - minLat)) * height);
      };
      const lngToX = (lng) => {
        return Math.floor(((lng - minLng) / (maxLng - minLng)) * width);
      };

      // Crear grid espacial para búsqueda rápida
      const gridSize = 50; // Tamaño de celda del grid
      const grid = new Map();
      
      data.forEach((p, idx) => {
        if (!p.latitude || !p.longitude) return;
        
        const x = lngToX(p.longitude);
        const y = latToY(p.latitude);
        const gridX = Math.floor(x / gridSize);
        const gridY = Math.floor(y / gridSize);
        const key = `${gridX},${gridY}`;
        
        if (!grid.has(key)) {
          grid.set(key, []);
        }
        grid.get(key).push({ x, y, intensity: p.intensity || 1, idx });
      });

      console.log(`Grid creado con ${grid.size} celdas`);

      // Buffer para el resultado final
      const buffer = new Float32Array(width * height);
      const hasValue = new Uint8Array(width * height);

      // Procesar píxeles en lotes
      const pixelsPerBatch = 50000;
      let processedPixels = 0;
      const totalPixels = width * height;

      const processBatch = () => {
        const end = Math.min(processedPixels + pixelsPerBatch, totalPixels);
        
        for (let i = processedPixels; i < end; i++) {
          const px = i % width;
          const py = Math.floor(i / width);
          
          // Buscar en celdas cercanas del grid
          const gridX = Math.floor(px / gridSize);
          const gridY = Math.floor(py / gridSize);
          
          let nearestDist = Infinity;
          let nearestIntensity = 0;
          const searchRadius = 2; // Buscar en celdas vecinas
          
          for (let gy = gridY - searchRadius; gy <= gridY + searchRadius; gy++) {
            for (let gx = gridX - searchRadius; gx <= gridX + searchRadius; gx++) {
              const key = `${gx},${gy}`;
              const cellPoints = grid.get(key);
              
              if (!cellPoints) continue;
              
              for (const point of cellPoints) {
                const dx = px - point.x;
                const dy = py - point.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < nearestDist && dist <= radius) {
                  nearestDist = dist;
                  nearestIntensity = point.intensity;
                }
              }
            }
          }
          
          // Si encontramos un punto cercano, usar interpolación suave
          if (nearestDist <= radius) {
            // Interpolación suave basada en distancia
            const falloff = 1 - (nearestDist / radius);
            buffer[i] = nearestIntensity * Math.pow(falloff, 0.5); // Suavizado moderado
            hasValue[i] = 1;
          }
        }

        processedPixels = end;

        if (processedPixels < totalPixels) {
          const progress = ((processedPixels / totalPixels) * 100).toFixed(1);
          console.log(`Procesado ${progress}% de píxeles...`);
          setTimeout(processBatch, 0);
        } else {
          finishHeatmap();
        }
      };

      const finishHeatmap = () => {
        console.log("Aplicando colores...");

        // Encontrar rango real de valores
        const values = [];
        for (let i = 0; i < buffer.length; i++) {
          if (hasValue[i] && buffer[i] > 0) {
            values.push(buffer[i]);
          }
        }
        
        values.sort((a, b) => a - b);
        
        const minVal = values[0] || 0.00001;
        const maxVal = values[values.length - 1] || 1;
        // Usar percentil 95 en lugar de 98 para ser más estricto
        const p95 = values[Math.floor(values.length * 0.95)] || maxVal;
        const p50 = values[Math.floor(values.length * 0.5)] || minVal;
        
        // Calcular rango logarítmico
        const logMin = Math.log10(Math.max(minVal, 1e-10));
        const logP95 = Math.log10(Math.max(p95, 1e-10));
        const logRange = logP95 - logMin;
        
        console.log(`Valores: min=${minVal.toExponential(2)}, max=${maxVal.toExponential(2)}, p50=${p50.toExponential(2)}, p95=${p95.toExponential(2)}`);
        console.log(`Rango logarítmico: ${logMin.toFixed(2)} a ${logP95.toFixed(2)} (span: ${logRange.toFixed(2)})`);
        console.log(`Píxeles con datos: ${values.length}/${buffer.length} (${(values.length/buffer.length*100).toFixed(2)}%)`);

        const img = ctx.createImageData(width, height);

        for (let i = 0; i < buffer.length; i++) {
          if (!hasValue[i] || buffer[i] === 0) continue;
          
          // Normalización LOGARÍTMICA usando p95 como máximo
          const logVal = Math.log10(Math.max(buffer[i], 1e-10));
          let norm = (logVal - logMin) / logRange;
          
          if (norm < 0) norm = 0;
          if (norm > 1) norm = 1;
          
          // Curva más agresiva: valores bajos más verdes, solo altos en rojo
          norm = Math.pow(norm, 2.0);

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