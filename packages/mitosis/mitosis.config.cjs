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
      plugins: [
        () => ({
          code: {
            // TypeScript >= 5.9 reports TS2454 ("used before being assigned")
            // for refs declared as `let __iframe: HTMLIFrameElement;` and read
            // inside closures. The variable is assigned by Solid's JSX `ref`,
            // so a definite assignment assertion is the idiomatic fix.
            post: (code) =>
              code.replace(/\blet __iframe: HTMLIFrameElement;/g, 'let __iframe!: HTMLIFrameElement;'),
          },
        }),
      ],
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
