#!/usr/bin/env bash
#MISE description="Verify all github actions are pinned"
ratchet lint .github/workflows/*.yaml
