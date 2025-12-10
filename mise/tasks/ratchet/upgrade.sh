#!/usr/bin/env bash
#MISE description="Upgrade all GitHub actions to latest"
ratchet upgrade .github/workflows/*.yaml
