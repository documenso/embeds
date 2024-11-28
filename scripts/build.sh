#!/usr/bin/env bash

set -e

npm run build -w @documenso/embed

npm run build -w @documenso/embed-angular
npm run build -w @documenso/embed-preact
npm run build -w @documenso/embed-react
npm run build -w @documenso/embed-solid
npm run build -w @documenso/embed-svelte
npm run build -w @documenso/embed-vue
npm run build -w @documenso/embed-webcomponent

npm run format