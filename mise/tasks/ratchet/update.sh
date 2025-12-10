#!/usr/bin/env bash
#MISE description="Upgrade all GitHub actions to latest version satisfying their version tag"
ratchet update .github/workflows/*.yaml
