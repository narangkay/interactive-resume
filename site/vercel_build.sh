#!/bin/bash
set -euxo pipefail

# build web llm
echo "building web llm..."
cd ../web-llm
npm install
npm run build
cd ../site
echo "built web llm..."

# build project itself
npm run build