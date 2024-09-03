import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: '@documenso/embed-react',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom'],
    },
  },
  plugins: [
    react(),
    dts({
      include: ['src'],
      afterBuild() {
        copyFileSync('dist/index.d.ts', 'dist/index.d.mts');
      },
    }),
  ],
});
