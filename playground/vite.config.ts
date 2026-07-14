import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // @documenso/embed-react is a symlinked file: dependency; the monorepo
    // uses legacy-peer-deps so react is not hoisted next to it. Force react
    // to resolve from the playground's own node_modules.
    dedupe: ['react', 'react-dom'],
  },
});
