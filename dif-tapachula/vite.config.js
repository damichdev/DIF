import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Cada microservicio atiende su propio prefijo /api/...
const MICRO = {
  '/api/medicos': 'http://localhost:8081',
  '/api/auth': 'http://localhost:8081',
  '/api/pacientes': 'http://localhost:8082',
  '/api/citas': 'http://localhost:8083',
  '/api/expedientes': 'http://localhost:8084',
  '/api/consultas': 'http://localhost:8084',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: MICRO },
})
