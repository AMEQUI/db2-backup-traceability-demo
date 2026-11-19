import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset URLs relative so the build works under https://amequi.github.io/<repo>/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
  css: { preprocessorOptions: { scss: { quietDeps: true, silenceDeprecations: ['import', 'global-builtin'] } } },
  build: { chunkSizeWarningLimit: 2500 },
});
