#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
fi

echo "Running migrations..."
alembic upgrade head

echo "Starting server..."
uv run -m uvicorn api.api_main:app --host 0.0.0.0 --port 8000 --reload
