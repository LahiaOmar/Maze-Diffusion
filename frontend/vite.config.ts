import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const backend_path = env.VITE_API_URL || 'http:localhost:5000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/solve': {
          target: backend_path,
          changeOrigin: true,
        },
      },
    },
  };
});
