import preact from '@preact/preset-vite';
import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: '@documenso/embed-preact',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['preact', 'preact/hooks'],
    },
  },
  plugins: [
    preact(),
    dts({
      include: ['src'],
      afterBuild() {
        copyFileSync('dist/index.d.ts', 'dist/index.d.mts');
      },
    }),
  ],
});
