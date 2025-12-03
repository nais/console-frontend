#!/usr/bin/env bash
#MISE description="Verify all github actions are pinned"
ratchet check .github/workflows/*.yaml
