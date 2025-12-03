#!/usr/bin/env bash
#MISE description="Upgrade all github actions to latest version satisfying their version tag"
ratchet update .github/workflows/*.yaml
