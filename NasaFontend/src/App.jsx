import { useState } from 'react'
import MapZonas, { SearchBox } from '/components/MapZone'
import './App.css'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <>
      <div className="w-full h-full overflow-hidden">
        <div className="w-full h-[100vh]">
          <MapZonas
            center={{ lat: 39.8283, lng: -98.5795 }}
            zoom={5}
            selectedLocation={selectedLocation}
            zonas={[
              {
                coords: [
                  { lat: -34.60, lng: -58.38 },
                  { lat: -34.61, lng: -58.39 },
                  { lat: -34.62, lng: -58.37 },
                ],
                color: "green",
              },
              {
                coords: [
                  { lat: -34.61, lng: -58.40 },
                  { lat: -34.62, lng: -58.41 },
                  { lat: -34.63, lng: -58.39 },
                ],
                color: "yellow",
              },
              {
                coords: [
                  { lat: -34.64, lng: -58.38 },
                  { lat: -34.65, lng: -58.39 },
                  { lat: -34.66, lng: -58.37 },
                ],
                color: "red",
              },
            ]}
          >
            <SearchBox onLocationSelect={setSelectedLocation} />
          </MapZonas>
        </div>
      </div>
    </>
  )
}

export default App