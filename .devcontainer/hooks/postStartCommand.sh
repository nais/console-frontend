#!/bin/bash
set -e

echo "Activating mise..."
eval "$(mise activate bash)"

echo "Running npm prepare..."
npm run prepare

echo "postStartCommand completed successfully!"
