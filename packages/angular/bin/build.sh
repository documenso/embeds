#!/bin/bash

set -e

cd "$(dirname "$0")/.."

# Replace or copy ./util/trusted-resource-url-pipe.ts to ./src/trusted-resource-url-pipe.ts 
cp ./util/trusted-resource-url-pipe.ts ./src/trusted-resource-url-pipe.ts

# Array of files to process
files=('./src/direct-template.ts' './src/sign-document.ts' './src/create-document.ts' './src/create-template.ts' './src/update-document.ts' './src/update-template.ts' './src/multisign-document.ts')

# Detect OS type
OS_TYPE=$(uname)

# Loop over the array of files
for file in "${files[@]}"
do
    if [ "$OS_TYPE" = "Darwin" ]; then
        # macOS (BSD) sed commands - only apply if not already present
        # Add pipe to iframe src (idempotent - check if not already present)
        grep -q 'src | trustedResourceUrl' "$file" || \
            sed -i '' 's/<iframe #__iframe \[class\]="className" \[attr\.src\]="src"><\/iframe>/<iframe #__iframe \[class\]="className" \[attr\.src\]="src | trustedResourceUrl"><\/iframe>/' "$file"
        # Add TrustedResourceUrlPipe to imports array (idempotent)
        grep -q 'TrustedResourceUrlPipe\]' "$file" || \
            sed -i '' 's/imports: \[CommonModule\],/imports: \[CommonModule, TrustedResourceUrlPipe\],/' "$file"
        # Add import statement at top (idempotent - check if not already present)
        grep -q 'import { TrustedResourceUrlPipe }' "$file" || \
            sed -i '' '1i\
import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
' "$file"
    else
        # GNU sed commands (Linux and others) - only apply if not already present
        grep -q 'src | trustedResourceUrl' "$file" || \
            sed -i 's/<iframe #__iframe \[class\]="className" \[attr\.src\]="src"><\/iframe>/<iframe #__iframe \[class\]="className" \[attr\.src\]="src | trustedResourceUrl"><\/iframe>/' "$file"
        grep -q 'TrustedResourceUrlPipe\]' "$file" || \
            sed -i 's/imports: \[CommonModule\],/imports: \[CommonModule, TrustedResourceUrlPipe\],/' "$file"
        grep -q 'import { TrustedResourceUrlPipe }' "$file" || \
            sed -i '1i\
import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
' "$file"
    fi
done

ng build
rollup --config
cp dist/index.d.ts dist/index.d.mts
