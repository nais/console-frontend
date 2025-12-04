#!/bin/bash
set -e

echo "Setting up shell configurations..."
# shellcheck disable=SC2016
echo 'eval "$(mise activate bash)"' >> ~/.bashrc
# shellcheck disable=SC2016
echo 'eval "$(mise activate zsh)"' >> ~/.zshrc

echo "Trusting mise directory..."
mise trust -y

# Installing go before other tools to allow mise to install go-based tools
echo "Installing Go..."
mise install go

echo "Installing all other tools..."
mise install

echo "onCreateCommand completed successfully!"
