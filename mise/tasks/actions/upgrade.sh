#!/usr/bin/env bash
#MISE description="Upgrade all github actions to latest"
ratchet upgrade .github/workflows/*.yaml
