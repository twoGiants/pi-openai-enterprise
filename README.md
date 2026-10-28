# pi-openai-enterprise

OpenAI Codex models (Sol, Astra, Luna, etc.) for ChatGPT Enterprise workspaces in [pi](https://github.com/earendil-works/pi).

## Problem

Pi's built-in `openai-codex` provider sends `originator: "pi"` during OAuth
login. Enterprise workspaces reject this with "Sign in with ChatGPT for
open-source apps isn't available for Enterprise workspaces yet."

This extension wraps Pi's built-in OAuth flow and calls it with
`originator: "codex_cli_rs"` (matching the Codex CLI), which Enterprise
workspaces accept. Nothing else is reimplemented.

## Compatibility

| Extension | pi |
|-----------|-----|
| 0.1.0 | 1.4.0 |

## Install

From git:

```bash
git clone https://github.com/twoGiants/pi-openai-enterprise.git \
  ~/.pi/agent/extensions/openai-enterprise
cd ~/.pi/agent/extensions/openai-enterprise
npm install
npm run build
```

## Setup

1. Start pi
2. Run `/login openai-enterprise`
3. Complete Enterprise SSO in your browser
4. Run `/model` and select a model (e.g., `gpt-6-sol`)

All models from the built-in `openai-codex` provider are available under the
`openai-enterprise` provider.

## How it works

The extension registers a native Provider via `createProvider()` that spreads
Pi's built-in `openaiCodexOAuth` and overrides `login()` to inject
`{ agentName: "codex_cli_rs" }`. Pi's OAuth implementation uses `agentName` as
the `originator` parameter in the authorization URL. Everything else (PKCE,
callback server, device code flow, token exchange, credential storage, model
catalog, streaming) is handled by Pi's built-in code.

The internal import is resolved by esbuild at build time and inlined into the
bundle, the same way Pi's own bundler handles built-in providers.

## Development

After changes to `index.ts`:

```bash
npm run build
```

The build produces `dist/index.js` which Pi loads at startup.

## Will this break on Pi updates?

Possibly. The extension imports from `@earendil-works/pi-ai/dist/auth/oauth/openai-codex.js`
which is an internal module. If Pi renames, moves, or changes the signature of
`openaiCodexOAuth`, the build will fail. Fix: update the import to match the
new internal API, then rebuild.

The public APIs (`pi-ai/compat`, `pi-ai/providers/all`, `pi-ai/oauth`) are
stable. Only the one internal import is fragile.

## License

MIT
