#!/bin/bash
set -euxo pipefail

# Function to determine the Linux distribution
get_distribution() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo $ID
    else
        echo "Unknown"
    fi
}

# Store the result
distribution=$(get_distribution)
echo "Executing on $distribution..."

# build emscripten
echo "building emscripten..."
cd ../emsdk
if [ "$distribution" = "amzn" ]; then
    yum install -y xz
fi
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
echo "built emscripten..."

# build tvm
echo "building tvm..."
cd ../relax
git submodule update --init --recursive
cd web && make && npm install && npm run build && cd -
echo "built tvm..."

# build web llm
echo "building web llm..."
cd ../web-llm
rm -rf tvm_home
ln -s ../relax tvm_home
npm install
npm run build
echo "built web llm..."

# build project itself
echo "building site..."
cd ../site
npm install
npm run build
echo "built site..."
