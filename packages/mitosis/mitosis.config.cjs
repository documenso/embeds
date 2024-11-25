const path = require('node:path');

/** @type {import('@builder.io/mitosis').MitosisConfig} */
module.exports = {
  targets: ['angular', 'preact', 'react', 'solid', 'svelte', 'vue'],
  dest: path.resolve(path.join(__dirname, '..')),
  // targets: ['react'],
  options: {
    angular: {
      typescript: true,
      standalone: true,
    },
    preact: {
      typescript: true,
    },
    react: {
      typescript: true,
    },
    solid: {
      typescript: true,
    },
    svelte: {
      typescript: true,
    },
    vue: {
      api: 'composition',
      typescript: true,
      defineComponent: true,
    },
  },
};
