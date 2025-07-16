import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: '0.0.0.0',
    hmr: {
      clientPort: 443,
      host: '5173-iubokf401j1pqbe8vstig-2b848cf1.manusvm.computer'
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
