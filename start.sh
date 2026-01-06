#!/usr/bin/env bash
# Exit on error
set -e

# Default to port 10000 if not set (Render default)
PORT=${PORT:-10000}

echo "==================================================="
echo "🚀 Starting Voice Agent Backend on Port $PORT"
echo "==================================================="

# Use exec to replace the shell with the process (proper signal handling)
exec uvicorn main:app --host 0.0.0.0 --port $PORT
