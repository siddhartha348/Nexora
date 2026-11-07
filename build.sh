#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=== [1/4] Installing Python requirements ==="
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "=== [2/4] Installing Node dependencies ==="
cd frontend
# Clean install ensuring optional platform-specific native binaries (e.g. linux-x64) are downloaded
rm -rf node_modules package-lock.json
npm install

echo "=== [3/4] Building Vite Frontend ==="
npm run build
cd ..

echo "=== [4/4] Build complete! ==="

