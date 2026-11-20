import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@repo/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
