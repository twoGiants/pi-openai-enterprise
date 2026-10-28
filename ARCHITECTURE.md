# Architecture

## What it does

Registers an `openai-enterprise` provider in Pi that gives Enterprise workspace
users access to OpenAI Codex models (Sol, Astra, Luna, etc.) via ChatGPT OAuth.

The only difference from the built-in `openai-codex` provider is the
`originator` parameter in the OAuth authorization URL: `"codex_cli_rs"` instead
of `"pi"`. Enterprise workspaces block third-party originators but accept the
Codex CLI originator.

## How it's built

### Extension registration (index.ts)

The extension uses `createProvider()` from `@earendil-works/pi-ai/models` to
register a native Provider. This gives the OAuth login function a native
`ProviderAuthInteraction` which passes straight through to Pi's built-in
`openaiCodexOAuth.login()`. No adapter or interface conversion needed.

- **Models**: Pulled from `getBuiltinModels("openai-codex")` at load time.
  New models added by Pi updates are picked up automatically.
- **Streaming**: Handled by `createProvider()` which wires models to their
  `api` field (`openai-codex-responses`). No custom streaming code.
- **OAuth**: Spreads Pi's `openaiCodexOAuth` object and overrides `login()`
  to inject `agentName: "codex_cli_rs"`. Pi's implementation handles PKCE,
  the callback server, device code flow, token exchange, and credential storage.
- **Token refresh**: Inherited from `openaiCodexOAuth.refresh` via the spread.

### Build step (build.mjs)

`openaiCodexOAuth` lives in `@earendil-works/pi-ai/dist/auth/oauth/openai-codex.js`,
which is not publicly exported via `package.json` exports. Extensions loaded by
Pi's jiti runtime cannot import it.

The build step uses esbuild with a plugin that resolves `@earendil-works/pi-ai/dist/*`
paths directly from the filesystem, bypassing exports. This is the same approach
Pi's own bundler uses for built-in providers. The internal code is inlined into
`dist/index.js`; public Pi APIs remain external imports resolved at runtime.

### Type declarations (pi-ai-internal.d.ts)

TypeScript also respects package exports and cannot resolve the internal import.
The `.d.ts` file provides type declarations for `openaiCodexOAuth` so
`tsc --noEmit` passes. These types mirror the actual `OAuthAuth` interface from
Pi's source.

## File overview

```
index.ts              Source. Provider registration, one login override.
build.mjs             esbuild config with pi-ai internal resolver plugin.
dist/index.js         Built bundle. What Pi loads at runtime.
pi-ai-internal.d.ts   Type declarations for the internal pi-ai import.
package.json          Extension metadata. Points Pi to dist/index.js.
tsconfig.json         TypeScript config for type checking.
check.sh              Health check: Pi updates, API changes, obsolescence.
update.sh             Reinstall deps + rebuild for a new Pi version.
```

## Update considerations

One internal import: `@earendil-works/pi-ai/dist/auth/oauth/openai-codex.js`.
If Pi renames, moves, or changes the `openaiCodexOAuth` export, the build fails.
Fix: update the import path, then rebuild.

Everything else uses stable public APIs:
- `@earendil-works/pi-ai/models` (`createProvider`)
- `@earendil-works/pi-ai/providers/all` (model catalog)
- `@earendil-works/pi-coding-agent` (ExtensionAPI)

## Health check

Run `./check.sh` to detect:
- Pi version updates that may require a rebuild
- Changes to the internal `openaiCodexOAuth` module (missing export, changed API)
- Whether Pi's built-in provider now uses `originator: "codex_cli_rs"` natively,
  which would make this extension unnecessary

The check downloads the tracked source file from GitHub and inspects it.
It does not modify the extension or contact OpenAI.
