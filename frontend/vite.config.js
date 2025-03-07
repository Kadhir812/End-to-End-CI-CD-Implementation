import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Enables binding to 0.0.0.0
    port: 5173, // Ensure it matches Docker port mapping
    proxy: {
      '/api': {
        target: 'http://backend-service.backend.svc.cluster.local:8080', // Use Kubernetes Service DNS
        changeOrigin: true,
        secure: false
      }
    }
  }
})
