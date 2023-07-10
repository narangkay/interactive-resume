#!/bin/bash

# ANSI escape code for green
GREEN='\033[0;32m'
# ANSI escape code for blue
BLUE='\033[0;34m'
# ANSI escape code to reset color
NC='\033[0m'

# Use green color for xtrace output
export PS4="${GREEN}+ ${NC}"

# Define a function to echo in blue
blue_echo() {
    echo -e "${BLUE}$*${NC}"
}

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
blue_echo "Executing on $distribution..."

# build emscripten
blue_echo "building emscripten..."
cd ../emsdk
if [ "$distribution" = "amzn" ]; then
    yum install -y xz
fi
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
blue_echo "built emscripten..."

# build tvm
blue_echo "building tvm..."
cd ../relax
git submodule update --init --recursive
cd web && make && npm install --production=false && npm run build && git restore package-lock.json && cd -
blue_echo "built tvm..."

# build web llm
blue_echo "building web llm..."
cd ../web-llm-src
rm -rf tvm_home
ln -s ../relax tvm_home
npm install --production=false
npm run build
git restore package-lock.json
blue_echo "built web llm..."

# build project itself
blue_echo "building site..."
cd ../site
npm install --production=false
npm run build
blue_echo "built site..."
