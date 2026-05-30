#!/usr/bin/env bash
# CineSync — one-click start script
# Usage: bash start.sh
set -e

echo ""
echo "  🎬  CineSync setup shuru..."
echo ""

# Node check
if ! command -v node >/dev/null 2>&1; then
  echo "  ❌ Node.js nahi mila. Pehle install karo: https://nodejs.org"
  exit 1
fi
echo "  ✅ Node.js: $(node -v)"

# Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "  📦 Dependencies install ho rahi hain (pehli baar, thoda ruko)..."
  npm install
else
  echo "  ✅ Dependencies already installed"
fi

echo ""
echo "  🚀 Server start ho raha hai... browser mein kholo: http://localhost:${PORT:-3000}"
echo ""
npm start
