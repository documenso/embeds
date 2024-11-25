#!/bin/bash

cd "$(dirname "$0")/.."

# Replace or copy ./util/trusted-resource-url-pipe.ts to ./src/trusted-resource-url-pipe.ts 
cp ./util/trusted-resource-url-pipe.ts ./src/trusted-resource-url-pipe.ts

# Array of files to process
files=('./src/direct-template.ts' './src/sign-document.ts')

# Loop over the array of files
for file in "${files[@]}"
do
    # Update the iframe line
    sed -i '' 's/<iframe #__iframe \[class\]="className" \[attr\.src\]="src"><\/iframe>/<iframe #__iframe \[class\]="className" \[attr\.src\]="src | trustedResourceUrl"><\/iframe>/' "$file"

    # Update the imports line
    sed -i '' 's/imports: \[CommonModule\],/imports: \[CommonModule, TrustedResourceUrlPipe\],/' "$file"

    # Add the import statement at the top of the file
    sed -i '' '1i\
import { TrustedResourceUrlPipe } from "./trusted-resource-url-pipe";
' "$file"

done

ng build
rollup --config
cp dist/index.d.ts dist/index.d.mts
