#!/bin/bash
set -e

echo "Setting up shell configurations..."
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc

echo "Trusting mise directory..."
mise trust -y

echo "Installing Go..."
mise install go

echo "Installing all other tools..."
mise install

echo "onCreateCommand completed successfully!"
