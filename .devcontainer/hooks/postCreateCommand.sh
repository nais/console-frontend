#!/bin/bash
set -e

echo "Activating mise..."
eval "$(mise activate bash)"

echo "Installing npm dependencies..."
npm install

echo "Running allow-scripts..."
npx allow-scripts auto

echo "Installing Ratchet tool via Go..."
go install github.com/sethvargo/ratchet@latest

echo "postCreateCommand completed successfully!"
