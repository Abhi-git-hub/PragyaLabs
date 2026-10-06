import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://127.0.0.1:3100',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
