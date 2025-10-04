import { useState } from 'react';
import MapZonas from '/components/MapZone'; // Corrige la ruta y nombre
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  // Datos de ejemplo para las zonas
  const zonasEjemplo = [
    {
      coordinates: [[51.505, -0.09], [51.51, -0.1], [51.51, -0.12]],
      color: 'red'
    }
  ];

  const center = [51.505, -0.09]; // Centro del mapa

  return (
    <div className="App">
      <h1>Mapa de Zonas</h1>
      <MapZonas 
        zonas={zonasEjemplo} 
        center={center} 
        zoom={13} 
      />
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;