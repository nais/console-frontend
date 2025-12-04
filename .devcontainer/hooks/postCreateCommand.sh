#!/bin/bash
set -e

echo "Activating mise..."
eval "$(mise activate bash)"

echo "Installing npm dependencies..."
npm install

echo "Running allow-scripts..."
npx allow-scripts auto

echo "postCreateCommand completed successfully!"
