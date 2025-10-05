export async function fetchAirQualityInArea(bbox, maxProcess = 50, sampling = 1) {
  try {
    const response = await fetch(
      `http://172.16.1.72:8000/air-quality/locations/in-area?bbox=${bbox}&max_process=${maxProcess}&sampling=${sampling}`
    );
    if (!response.ok) throw new Error("Error en la consulta");
    const data = await response.json();
    console.log("Air Quality Data:", data);
    return data;
  } catch (error) {
    console.error("Error al consultar air quality:", error);
    return null;
  }
}