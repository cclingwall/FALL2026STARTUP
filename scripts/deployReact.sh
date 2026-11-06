#!/usr/bin/env bash
set -euo pipefail
printf 'Pitch Royale now includes a backend; forwarding to deployService.sh.\n'
exec bash "$(dirname -- "${BASH_SOURCE[0]}")/deployService.sh" "$@"
