#!/bin/bash
set -e

echo "Activating mise..."
export PATH="$HOME/.local/bin:$PATH"
eval "$(mise activate bash)"

echo "Installing npq globally..."
npm install -g npq@3.14.0

echo "Installing npm dependencies..."
npq-hero install

echo "Running allow-scripts..."
npm run allow-scripts

echo "Setting up npm alias for future use..."
echo 'alias npm="npq-hero"' >> "$HOME/.bashrc"

echo "postCreateCommand completed successfully!"
