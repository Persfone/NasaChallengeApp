import { useState } from 'react'
import MapZonas from '/components/MapZone'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="w-full h-[80vh] rounded overflow-hidden">
      <div className="w-[1920px] h-[1080px]">

        <MapZonas
          center={{ lat: -34.6, lng: -58.38 }}
          zoom={12}
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
                { lat : -34.66, lng: -58.37 },
              ],
              color: "red",
            },
          ]}
          />
        </div>
      </div>

    </>
  )
}

export default App
