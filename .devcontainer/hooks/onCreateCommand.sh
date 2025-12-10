#!/bin/bash
set -e

echo "Trusting mise directory..."
mise trust -y

# Installing go before other tools to allow mise to install go-based tools
echo "Installing Go..."
mise install go

echo "Installing all other tools..."
mise install

echo "onCreateCommand completed successfully!"
