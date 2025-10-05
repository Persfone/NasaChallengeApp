// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
        // configure se ejecuta con la instancia http-proxy
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            try {
              // Evitamos que el backend remoto reciba el header Origin que lo hace bloquear
              proxyReq.removeHeader('origin');
              // Identificamos la petición (Nominatim pide identificación)
              proxyReq.setHeader('referer', 'http://localhost:5173');
              proxyReq.setHeader('User-Agent', 'NasaChallengeApp/1.0 (guido@example.com)');
            } catch (e) {
              // por seguridad, no romper el servidor si algo falla aquí
              // pero logueamos para que lo veas en terminal si querés debug
              // console.warn('proxy configure error', e);
            }
          });
        },
      },
    },
  },
});
