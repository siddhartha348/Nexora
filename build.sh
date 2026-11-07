#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=== [1/4] Installing Python requirements ==="
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "=== [2/4] Installing Node dependencies ==="
cd frontend
# Install dependencies including explicit linux binding
npm install --include=optional

echo "=== [3/4] Building Vite Frontend ==="
npm run build
cd ..

echo "=== [4/4] Build complete! ==="

