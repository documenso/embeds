export default {
  external: ['@angular/core', '@angular/common', '@angular/platform-browser'],
  input: 'dist/esm2022/documenso-embed-angular.mjs',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
  },
};
