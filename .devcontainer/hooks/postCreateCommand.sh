#!/bin/bash
set -e

echo "Activating mise..."
export PATH="$HOME/.local/bin:$PATH"
eval "$(mise activate bash)"

echo "Installing npq globally..."
npm install -g npq

echo "Setting up npm alias..."
echo 'alias npm="npq-hero"' >> ~/.bashrc
source ~/.bashrc

echo "Installing npm dependencies..."
npq-hero install

echo "Running allow-scripts..."
npm run allow-scripts

echo "postCreateCommand completed successfully!"
