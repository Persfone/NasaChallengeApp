# 🌍 NasaChallengeApp

**NasaChallengeApp** es una aplicación de monitoreo de salud ambiental diseñada para visualizar la calidad del aire y condiciones médicas en Estados Unidos mediante un mapa interactivo.

La aplicación permite buscar ubicaciones, visualizar zonas geográficas y filtrar información relacionada con enfermedades respiratorias y cardiovasculares.

---

# 🚀 Descripción del Proyecto

NasaChallengeApp es una **Single Page Application (SPA)** desarrollada con **React** que funciona completamente en el cliente y utiliza servicios externos para la búsqueda de ubicaciones.

El objetivo principal es proporcionar una herramienta de visualización geográfica interactiva que permita analizar datos ambientales y su impacto en la salud.

---

# 🧠 Funcionalidades Principales

### 🗺️ Mapa Interactivo

* Visualización de zonas geográficas
* Zoom y desplazamiento
* Renderizado con Leaflet
* Integración con OpenStreetMap
* Polígonos de zonas

---

### 🔍 Búsqueda de Ubicación

* Búsqueda de ciudades y lugares en Estados Unidos
* API de Nominatim (OpenStreetMap)
* Debounce de 500ms
* Transición animada del buscador
* Centrado automático en el mapa

---

### 🏥 Filtro de Condiciones Médicas (En desarrollo)

* Alergias respiratorias
* Asma
* Hipertensión
* EPOC
* Botón de aplicar filtros

Actualmente la interfaz está implementada pero falta la lógica de filtrado.

---

# 🏗️ Arquitectura

La aplicación sigue una arquitectura **React con flujo de datos unidireccional**.

### Estado principal

```
selectedLocation
```

Controla:

* posición del mapa
* zoom
* ubicación seleccionada
* comportamiento del buscador

Flujo:

```
SearchBox → App.jsx → MapZone
                     → Desplegable
```

---

# 🧩 Estructura del Proyecto

```
NasaFrontend
│
├── src
│   ├── components
│   │   ├── MapZone.jsx
│   │   ├── SearchBox.jsx
│   │   ├── Desplegable.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│
├── package.json
├── README.md
```

---

# 🛠️ Tecnologías Utilizadas

### Frontend

* React 19
* Vite
* TailwindCSS
* Leaflet
* React Leaflet
* Lucide React

### Optimización

* React Compiler
* Babel Plugin

### API

* OpenStreetMap Nominatim

---

# 📊 Tecnologías en detalle

| Tecnología    | Uso                     |
| ------------- | ----------------------- |
| React         | Interfaz de usuario     |
| Vite          | Build y desarrollo      |
| Tailwind      | Estilos                 |
| Leaflet       | Mapa interactivo        |
| React Leaflet | Integración con React   |
| Nominatim     | Búsqueda de ubicaciones |
| Lucide        | Iconos                  |

---

# 🔄 Flujo de Datos

1. El usuario busca una ubicación
2. SearchBox consulta Nominatim
3. Se obtiene la ubicación
4. Se actualiza selectedLocation
5. El mapa se centra automáticamente
6. Se muestran zonas geográficas

---

# 🌐 API Externa

### OpenStreetMap Nominatim

Se utiliza para:

* búsqueda de ciudades
* geocodificación
* coordenadas

No requiere API Key.

---

# ▶️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Persfone/NasaChallengeApp
```

---

### 2. Entrar al proyecto

```bash
cd NasaChallengeApp/NasaFrontend
```

---

### 3. Instalar dependencias

```bash
npm install
```

---

### 4. Ejecutar el proyecto

```bash
npm run dev
```

---

# 🏗️ Build de Producción

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

# 📌 Estado del Proyecto

### ✅ Implementado

* Mapa interactivo
* Búsqueda de ubicación
* UI responsive
* Arquitectura React
* Integración OpenStreetMap

---

### 🚧 En desarrollo

* Filtros médicos
* Datos de zonas
* Backend API
* Integración de datos ambientales
* TypeScript
* Testing

---

# 🔮 Trabajo Futuro

* Implementar filtros médicos funcionales
* Integrar datos de calidad del aire
* Conectar backend
* Agregar base de datos
* Migrar a TypeScript
* Implementar testing
* Mejorar performance


