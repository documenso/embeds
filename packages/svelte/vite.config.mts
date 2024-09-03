import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: '@documenso/embed-preact',
      formats: ['es', 'cjs', 'umd'],
      fileName: 'index',
    },
  },
  plugins: [sveltekit(), dts({ include: ['src'] })],
});
