#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(readlink -f "$(dirname "$0")")"
MONOREPO_ROOT="$(readlink -f "$SCRIPT_DIR/../")"

pushd "$MONOREPO_ROOT" > /dev/null

trap "popd > /dev/null" EXIT
trap "popd > /dev/null" ERR

npm run build -w @documenso/embed

npm run build -w @documenso/embed-angular
npm run build -w @documenso/embed-preact
npm run build -w @documenso/embed-react
npm run build -w @documenso/embed-solid
npm run build -w @documenso/embed-svelte
npm run build -w @documenso/embed-vue
npm run build -w @documenso/embed-webcomponent

npm run format
