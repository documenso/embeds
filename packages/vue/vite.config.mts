import vue from '@vitejs/plugin-vue';
import { copyFileSync } from 'node:fs';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: '@documenso/embed-vue',
      formats: ['es', 'cjs'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
  plugins: [
    AutoImport({
      imports: ['vue'],
      vueTemplate: true,
    }),
    vue(),
    dts({
      include: ['src', 'auto-imports.d.ts'],
      afterBuild() {
        copyFileSync('dist/index.d.ts', 'dist/index.d.mts');
      },
    }),
  ],
});
