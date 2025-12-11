#!/bin/bash
set -e

echo "Activating mise..."
export PATH="$HOME/.local/bin:$PATH"
eval "$(mise activate bash)"

echo "Installing npq globally..."
npm install -g npq@3.14.0

echo "Setting up npm alias..."
echo 'alias npm="npq-hero"' >> "$HOME/.bashrc"

echo "Installing npm dependencies..."
npm install

echo "Running allow-scripts..."
npm run allow-scripts

echo "postCreateCommand completed successfully!"
