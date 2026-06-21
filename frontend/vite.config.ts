import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const backend_path = env.VITE_BACKEND_URL || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/solve': {
          target: backend_path,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/solve/, '/api/solve'),
        },
      },
    },
  };
});
