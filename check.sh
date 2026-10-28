#!/usr/bin/env bash
set -euo pipefail

# Health check for the openai-enterprise extension.
# Usage: ./check.sh
#
# Checks:
# 1. Is a Pi update available that may affect us?
# 2. Has the internal openai-codex OAuth module changed?
# 3. Does the built-in openai-codex provider now use a different originator?
#    (If it switched to "codex_cli_rs", this extension is unnecessary.)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TRACKED_FILE="auth/oauth/openai-codex.ts"
PI_RAW="https://raw.githubusercontent.com/earendil-works/pi"

INSTALLED=$(node -e "console.log(require('$SCRIPT_DIR/node_modules/@earendil-works/pi-ai/package.json').version)" 2>/dev/null || echo "unknown")
LATEST=$(npm show @earendil-works/pi-coding-agent version 2>/dev/null || echo "unknown")

echo "Installed pi-ai: $INSTALLED"
echo "Latest pi:       $LATEST"

# Check 1: version mismatch
if [ "$INSTALLED" != "unknown" ] && [ "$LATEST" != "unknown" ] && [ "$INSTALLED" != "$LATEST" ]; then
  echo ""
  echo "UPDATE AVAILABLE: $INSTALLED -> $LATEST"
  echo "Run: ./update.sh"
fi

# Check 2: has the tracked internal module changed upstream?
if [ "$LATEST" != "unknown" ]; then
  TMPFILE=$(mktemp)
  trap 'rm -f "$TMPFILE"' EXIT
  if curl -sf "$PI_RAW/v${LATEST}/packages/ai/src/$TRACKED_FILE" -o "$TMPFILE" 2>/dev/null; then
    # Check if openaiCodexOAuth export still exists
    if ! grep -q "openaiCodexOAuth" "$TMPFILE"; then
      echo ""
      echo "WARNING: openaiCodexOAuth export not found in pi v${LATEST}."
      echo "The internal API may have changed. Build will likely fail."
    fi

    # Check if createAuthorizationFlow still accepts originator/agentName
    if ! grep -q "agentName\|originator" "$TMPFILE"; then
      echo ""
      echo "WARNING: agentName/originator not found in pi v${LATEST}."
      echo "The OAuth flow may have changed."
    fi

    # Check 3: has Pi changed the default originator?
    if grep -q 'originator.*=.*"codex_cli_rs"' "$TMPFILE"; then
      echo ""
      echo "NOTE: Pi's built-in openai-codex now uses originator 'codex_cli_rs'."
      echo "This extension may no longer be needed. Try /login openai-codex directly."
    fi
  else
    echo ""
    echo "WARNING: Could not download $TRACKED_FILE from pi v${LATEST}."
    echo "The file may have moved. Check: https://github.com/earendil-works/pi/tree/v${LATEST}/packages/ai/src/auth/oauth/"
  fi
fi

# Check 4: does the bundle exist?
if [ ! -f "$SCRIPT_DIR/dist/index.js" ]; then
  echo ""
  echo "ERROR: dist/index.js not found. Run: npm run build"
fi

echo ""
echo "Done."
