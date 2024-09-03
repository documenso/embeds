import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
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
  plugins: [
    AutoImport({
      imports: ['vue'],
      vueTemplate: true,
    }),
    vue(),
    dts({ include: ['src', 'auto-imports.d.ts'] }),
  ],
});
