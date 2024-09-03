import { sveltekit } from '@sveltejs/kit/vite';
import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: '@documenso/embed-svelte',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
  },
  plugins: [
    sveltekit(),
    dts({
      include: ['src'],
      afterBuild() {
        copyFileSync('dist/index.d.ts', 'dist/index.d.mts');
      },
    }),
  ],
});
