#!/bin/bash
set -e

echo "Activating mise..."
eval "$(mise activate bash)"

echo "Syncing SvelteKit..."
npm run prepare

echo "postStartCommand completed successfully!"
