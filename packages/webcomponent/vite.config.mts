import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: '@documenso/embed-webcomponent',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'index',
    },
  },
  plugins: [preact(), dts({ include: ['src'] })],
});
