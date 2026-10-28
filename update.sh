#!/usr/bin/env bash
set -euo pipefail

# Updates the extension to a new pi version.
# Usage: ./update.sh [version]
# If no version is given, uses the latest from npm.

VERSION="${1:-$(npm show @earendil-works/pi-coding-agent version)}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Updating to pi $VERSION..."

# Reinstall node_modules so peer dependencies resolve to the new version.
rm -rf node_modules package-lock.json
npm install --ignore-scripts

# Rebuild. If the internal pi-ai import changed, this fails here.
npm run build

echo "Done. Updated to pi $VERSION."
echo "Test with: pi --list-models 2>&1 | grep openai-enterprise"
echo "Commit the changes to complete the update."
