export async function fetchAirQualityInArea(bbox, maxProcess = 50, sampling = 1) {
  try {
    const response = await fetch(
      `http://localhost:8000/air-quality/locations/in-area?bbox=${bbox}&max_process=${maxProcess}&sampling=${sampling}`
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

export async function fetchNO2Data(lat_min, lat_max, lon_min, lon_max) {
  try {
    const response = await fetch(
      `http://localhost:8000/tempo/get_data_NO2/${lat_min}/${lat_max}/${lon_min}/${lon_max}`
    );
    if (!response.ok) throw new Error("Error en la consulta NO2");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al consultar NO2:", error);
    return null;
  }
}

export async function fetchSO2Data(lat_min, lat_max, lon_min, lon_max) {
  try {
    const response = await fetch(
      `http://localhost:8000/tempo/get_data_SO2/${lat_min}/${lat_max}/${lon_min}/${lon_max}`
    );
    if (!response.ok) throw new Error("Error en la consulta SO2");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al consultar SO2:", error);
    return null;
  }
}

export async function fetchO3Data(lat_min, lat_max, lon_min, lon_max) {
  try {
    const response = await fetch(
      `http://localhost:8000/tempo/get_data_O3/${lat_min}/${lat_max}/${lon_min}/${lon_max}`
    );
    if (!response.ok) throw new Error("Error en la consulta O3");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al consultar O3:", error);
    return null;
  }
}

export async function fetchHCHOData(lat_min, lat_max, lon_min, lon_max) {
  try {
    const response = await fetch(
      `http://localhost:8000/tempo/get_data_HCHO/${lat_min}/${lat_max}/${lon_min}/${lon_max}`
    );
    if (!response.ok) throw new Error("Error en la consulta HCHO");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al consultar HCHO:", error);
    return null;
  }
}

export async function fetchAERData(lat_min, lat_max, lon_min, lon_max) {
  try {
    const response = await fetch(
      `http://localhost:8000/tempo/get_data_AER/${lat_min}/${lat_max}/${lon_min}/${lon_max}`
    );
    if (!response.ok) throw new Error("Error en la consulta AER");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al consultar AER:", error);
    return null;
  }
}