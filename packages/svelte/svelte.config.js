import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const vite = vitePreprocess({ script: true });

/**
 * Strips TypeScript from the shipped .svelte files so they work on Svelte 4
 * consumers without a TS preprocessor.
 *
 * - `script: true` is required because vitePreprocess leaves scripts alone by
 *   default under Svelte 5.
 * - `@sveltejs/package` keeps `lang="ts"` when built with Svelte 5, so the
 *   attribute is dropped here once the script body is plain JS.
 * - Note: @sveltejs/package only loads svelte.config.js/.ts, not .mjs.
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  preprocess: {
    ...vite,
    async script(options) {
      const processed = await vite.script(options);

      if (processed && options.attributes.lang === 'ts') {
        const { lang, ...attributes } = options.attributes;
        return { ...processed, attributes };
      }

      return processed;
    },
  },
};

export default config;
