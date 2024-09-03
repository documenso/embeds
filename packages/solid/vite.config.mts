import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import solid from 'vite-plugin-solid';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: '@documenso/embed-preact',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'index',
    },
  },
  plugins: [solid(), dts({ include: ['src'] })],
});
