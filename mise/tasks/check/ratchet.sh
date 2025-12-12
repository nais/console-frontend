#!/usr/bin/env bash
#MISE description="Verify all GitHub actions are pinned"
ratchet lint .github/workflows/*.yaml
