#!/bin/bash
set -e

echo "Activating mise..."
eval "$(mise activate bash)"

echo "Installing npm dependencies..."
npm install

echo "Running allow-scripts..."
npm run allow-scripts

echo "postCreateCommand completed successfully!"
