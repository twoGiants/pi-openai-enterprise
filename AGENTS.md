# Project Overview

Pi extension that enables OpenAI Codex models for ChatGPT Enterprise workspaces.

## How it works

The extension registers a native Provider via `createProvider()` that spreads
Pi's built-in `openaiCodexOAuth` and overrides `login()` to inject
`agentName: "codex_cli_rs"` so the OAuth originator matches the Codex CLI.
Enterprise workspaces reject `"pi"` but accept `"codex_cli_rs"`. Nothing else
is reimplemented: models, streaming, PKCE, callback server, token exchange,
and credential storage are all handled by Pi's built-in code.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design.

## Key files

- `index.ts`: Extension source. Provider registration, one login override.
- `build.mjs`: esbuild config. Resolves internal pi-ai imports at build time.
- `dist/index.js`: Built bundle. What Pi loads at runtime.
- `pi-ai-internal.d.ts`: Type declarations for the internal pi-ai import.
- `check.sh`: Health check. Detects Pi updates, API changes, and whether the extension is still needed.
- `update.sh`: Reinstalls dependencies and rebuilds for a new Pi version.

## Rules

- Always show changes for review before committing. Never commit without approval.
- Do not use em dashes in text. Use colons, commas, or separate sentences instead.
- Run `npm run build` after any change to `index.ts` or `build.mjs`.
- Run `npm run build` to verify types before committing.
