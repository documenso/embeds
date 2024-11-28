#!/bin/bash

set -e

cd "$(dirname "$0")/.."

# Replace or copy ./util/trusted-resource-url-pipe.ts to ./src/trusted-resource-url-pipe.ts 
cp ./util/trusted-resource-url-pipe.ts ./src/trusted-resource-url-pipe.ts

# Array of files to process
files=('./src/direct-template.ts' './src/sign-document.ts')

# Detect OS type
OS_TYPE=$(uname)

# Loop over the array of files
for file in "${files[@]}"
do
    if [ "$OS_TYPE" = "Darwin" ]; then
        # macOS (BSD) sed commands
        sed -i '' 's/<iframe #__iframe \[class\]="className" \[attr\.src\]="src"><\/iframe>/<iframe #__iframe \[class\]="className" \[attr\.src\]="src | trustedResourceUrl"><\/iframe>/' "$file"
        sed -i '' 's/imports: \[CommonModule\],/imports: \[CommonModule, TrustedResourceUrlPipe\],/' "$file"
        sed -i '' '1i\
import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
' "$file"
    else
        # GNU sed commands (Linux and others)
        sed -i 's/<iframe #__iframe \[class\]="className" \[attr\.src\]="src"><\/iframe>/<iframe #__iframe \[class\]="className" \[attr\.src\]="src | trustedResourceUrl"><\/iframe>/' "$file"
        sed -i 's/imports: \[CommonModule\],/imports: \[CommonModule, TrustedResourceUrlPipe\],/' "$file"
        sed -i '1i\
import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
' "$file"
    fi
done

ng build
rollup --config
cp dist/index.d.ts dist/index.d.mts
