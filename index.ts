/**
 * pi-openai-enterprise -- OpenAI Codex models for Enterprise workspaces
 *
 * Pi's built-in openai-codex provider handles everything: model catalog,
 * streaming (openai-codex-responses API), PKCE, callback server, device code
 * flow, token exchange, and credential storage. The only problem is the OAuth
 * authorization URL sends originator: "pi", which Enterprise workspaces reject.
 *
 * This extension imports Pi's openaiCodexOAuth and wraps it with
 * agentName: "codex_cli_rs" (matching the Codex CLI). Nothing else is
 * reimplemented. By registering a native Provider via createProvider(),
 * the login function receives ProviderAuthInteraction directly, so we can
 * pass it straight through to openaiCodexOAuth.login() with no adapter.
 *
 * The import from pi-ai/dist/auth/oauth/ is not publicly exported. esbuild
 * resolves it from the filesystem at build time and inlines it into the
 * bundle, the same way Pi's own bundler handles built-in providers.
 * Run `npm run build` after changes.
 *
 * Usage:
 *   /login openai-enterprise -- sign in with Enterprise SSO
 *   /model                   -- pick gpt-6-sol, gpt-6-astra, etc.
 */

import { createProvider } from "@earendil-works/pi-ai/models";
import { openaiCodexOAuth } from "@earendil-works/pi-ai/dist/auth/oauth/openai-codex.js";
import { getApiProvider } from "@earendil-works/pi-ai/compat";
import { getBuiltinModels } from "@earendil-works/pi-ai/providers/all";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  const models = getBuiltinModels("openai-codex").map((m) => ({
    ...m,
    provider: "openai-enterprise",
  }));
  if (!models.length) throw new Error("openai-enterprise: no openai-codex models found. Is Pi updated?");

  const api = getApiProvider("openai-codex-responses");
  if (!api) throw new Error("openai-enterprise: openai-codex-responses API not found. Is Pi updated?");

  pi.registerProvider(
    createProvider({
      id: "openai-enterprise",
      name: "OpenAI Enterprise",
      baseUrl: "https://chatgpt.com/backend-api",
      models,
      api,
      auth: {
        oauth: {
          ...openaiCodexOAuth,
          name: "OpenAI Enterprise (ChatGPT)",
          login: (interaction, options) =>
            openaiCodexOAuth.login(interaction, {
              ...options,
              agentName: "codex_cli_rs",
            }),
        },
      },
    }),
  );
}
