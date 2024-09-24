#!/bin/bash

cd "../$(dirname "$0")"

# Check if the Angular build requirements are done
if [ ! -f "./src/trusted-resource-url-pipe.ts" ]; then
    echo "----------------------------------------------" >&2
    echo "Please review the README.md build instructions" >&2
    echo "----------------------------------------------" >&2
    exit 1
fi

ng build
rollup --config
cp dist/index.d.ts dist/index.d.mts