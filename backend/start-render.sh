#!/usr/bin/env bash
set -euo pipefail

PORT_VALUE="${PORT:-10000}"

exec uv run python -m uvicorn api.api_main:app --host 0.0.0.0 --port "${PORT_VALUE}"
