#!/usr/bin/env bash
# Force Python to print logs immediately
export PYTHONUNBUFFERED=1

# Default to port 10000 if not set
PORT=${PORT:-10000}

echo "==================================================="
echo "🚀 Starting Backend (Debug Mode)"
echo "Port: $PORT"
echo "Directory: $(pwd)"
echo "==================================================="

# Run uvicorn main:app --host 0.0.0.0 --port $PORT --log-level debug
