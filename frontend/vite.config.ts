import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() 
  ],
  server: {
    proxy: {
      '/solve': {
        target: 'http://localhost:5000/api/',
        changeOrigin: true,
      }
    }
  }
})
