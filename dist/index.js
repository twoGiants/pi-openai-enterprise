var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// index.ts
import { createProvider } from "@earendil-works/pi-ai/models";

// node_modules/@earendil-works/pi-ai/dist/utils/provider-env.js
var procEnvCache = null;
function getBunSandboxEnvValue(name) {
  if (typeof process === "undefined" || !process.versions?.bun || Object.keys(process.env).length > 0) {
    return void 0;
  }
  if (procEnvCache === null) {
    procEnvCache = /* @__PURE__ */ new Map();
    try {
      const { readFileSync } = __require("node:fs");
      const data = readFileSync("/proc/self/environ", "utf-8");
      for (const entry of data.split("\0")) {
        const idx = entry.indexOf("=");
        if (idx > 0) {
          procEnvCache.set(entry.slice(0, idx), entry.slice(idx + 1));
        }
      }
    } catch {
    }
  }
  return procEnvCache.get(name);
}
function getProviderEnvValue(name, env) {
  return env?.[name] || (typeof process !== "undefined" ? process.env[name] : void 0) || getBunSandboxEnvValue(name) || void 0;
}

// node_modules/@earendil-works/pi-ai/dist/auth/oauth/callback-server.js
import { createServer } from "node:http";

// node_modules/@earendil-works/pi-ai/dist/utils/oauth-page.js
var LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" aria-hidden="true"><path fill="#F09082" d="M165.29 165.29H517.36V400H400V282.65H165.29Z"/><path fill="#4D9ABF" d="M165.29 282.65H282.65V400H400V517.36H282.65V634.72H165.29Z"/><path fill="#F1BE58" d="M517.36 400H634.72V634.72H517.36Z"/></svg>`;
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function renderPage(options) {
  const title = escapeHtml(options.title);
  const heading = escapeHtml(options.heading);
  const message = escapeHtml(options.message);
  const details = options.details ? escapeHtml(options.details) : void 0;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root {
      --text: #fafafa;
      --text-dim: #a1a1aa;
      --page-bg: #09090b;
      --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    * { box-sizing: border-box; }
    html { color-scheme: dark; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: var(--page-bg);
      color: var(--text);
      font-family: var(--font-sans);
      text-align: center;
    }
    main {
      width: 100%;
      max-width: 560px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .logo {
      width: 72px;
      height: 72px;
      display: block;
      margin-bottom: 24px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 28px;
      line-height: 1.15;
      font-weight: 650;
      color: var(--text);
    }
    p {
      margin: 0;
      line-height: 1.7;
      color: var(--text-dim);
      font-size: 15px;
    }
    .details {
      margin-top: 16px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--text-dim);
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <main>
    <div class="logo">${LOGO_SVG}</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    ${details ? `<div class="details">${details}</div>` : ""}
  </main>
</body>
</html>`;
}
function oauthSuccessHtml(message) {
  return renderPage({
    title: "Authentication successful",
    heading: "Authentication successful",
    message
  });
}
function oauthErrorHtml(message, details) {
  return renderPage({
    title: "Authentication failed",
    heading: "Authentication failed",
    message,
    details
  });
}

// node_modules/@earendil-works/pi-ai/dist/auth/oauth/callback-server.js
function sendPage(response, status, html) {
  response.writeHead(status, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  response.end(html);
}
async function startOAuthCallbackServer(options) {
  const { providerName, signal } = options;
  if (signal?.aborted)
    throw new Error("Login cancelled");
  let resolveWait = () => {
  };
  let rejectWait = () => {
  };
  const waitPromise = new Promise((resolve, reject) => {
    resolveWait = resolve;
    rejectWait = reject;
  });
  waitPromise.catch(() => void 0);
  let claimed = false;
  let settled = false;
  let timer;
  const onAbort = () => finish({ error: new Error("Login cancelled") });
  const finish = (result) => {
    if (settled)
      return;
    settled = true;
    if (timer)
      clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
    if ("error" in result)
      rejectWait(result.error);
    else
      resolveWait(result.value);
  };
  const server = createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (request.method !== "GET" || url.pathname !== options.path) {
        sendPage(response, 404, oauthErrorHtml("Callback route not found."));
        return;
      }
      if (options.state !== void 0 && url.searchParams.get("state") !== options.state) {
        sendPage(response, 400, oauthErrorHtml("State mismatch."));
        return;
      }
      if (claimed || settled) {
        sendPage(response, 409, oauthErrorHtml("This sign-in has already been handled."));
        return;
      }
      const error = url.searchParams.get("error");
      if (error) {
        const description = url.searchParams.get("error_description") ?? error;
        sendPage(response, 400, oauthErrorHtml(`${providerName} authorization failed.`, description));
        finish({ error: new Error(`${providerName} authorization failed: ${description}`) });
        return;
      }
      const code = url.searchParams.get("code");
      if (!code) {
        sendPage(response, 400, oauthErrorHtml("Missing authorization code."));
        return;
      }
      claimed = true;
      try {
        const value = await options.complete(code);
        sendPage(response, 200, oauthSuccessHtml(`Signed in to ${providerName}. You may now close this page.`));
        finish({ value });
      } catch (error2) {
        const failure = error2 instanceof Error ? error2 : new Error(String(error2));
        sendPage(response, 502, oauthErrorHtml(`${providerName} sign-in failed.`, failure.message));
        finish({ error: failure });
      }
    })();
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("OAuth callback server did not bind to TCP");
  }
  server.on("error", (error) => finish({ error }));
  signal?.addEventListener("abort", onAbort, { once: true });
  if (options.timeoutMs !== void 0) {
    timer = setTimeout(() => finish({ error: new Error(`${providerName} sign-in timed out`) }), options.timeoutMs);
  }
  const redirectHost = options.redirectHost ?? options.host;
  return {
    redirectUri: `http://${redirectHost.includes(":") ? `[${redirectHost}]` : redirectHost}:${address.port}${options.path}`,
    wait: () => waitPromise,
    cancel: () => {
      if (!claimed)
        finish({ value: void 0 });
    },
    close: () => {
      finish({ error: new Error("OAuth callback server closed") });
      server.close();
    }
  };
}
async function waitForCallbackOrManualInput(interaction, callback, prompt) {
  const manualAbort = new AbortController();
  let manualError;
  const manual = interaction.prompt({ type: "manual_code", ...prompt, signal: manualAbort.signal }).then((input) => {
    callback?.cancel();
    return input;
  }).catch((error) => {
    manualError = error instanceof Error ? error : new Error(String(error));
    callback?.cancel();
    return void 0;
  });
  try {
    const value = await callback?.wait();
    if (manualError)
      throw manualError;
    if (value !== void 0)
      return { type: "callback", value };
    const input = await manual;
    if (manualError)
      throw manualError;
    return { type: "manual", input: input ?? "" };
  } finally {
    manualAbort.abort();
  }
}

// node_modules/@earendil-works/pi-ai/dist/auth/oauth/device-code.js
var CANCEL_MESSAGE = "Login cancelled";
var TIMEOUT_MESSAGE = "Device flow timed out";
var SLOW_DOWN_TIMEOUT_MESSAGE = "Device flow timed out after one or more slow_down responses. This is often caused by clock drift in WSL or VM environments. Please sync or restart the VM clock and try again.";
var MINIMUM_INTERVAL_MS = 1e3;
var DEFAULT_POLL_INTERVAL_SECONDS = 5;
var SLOW_DOWN_INTERVAL_INCREMENT_MS = 5e3;
function abortableSleep(ms, signal, cancelMessage) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error(cancelMessage));
      return;
    }
    const onAbort = () => {
      clearTimeout(timeout);
      reject(new Error(cancelMessage));
    };
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
async function pollOAuthDeviceCodeFlow(options) {
  const deadline = typeof options.expiresInSeconds === "number" ? Date.now() + options.expiresInSeconds * 1e3 : Number.POSITIVE_INFINITY;
  let intervalMs = Math.max(MINIMUM_INTERVAL_MS, Math.floor((options.intervalSeconds ?? DEFAULT_POLL_INTERVAL_SECONDS) * 1e3));
  let slowDownResponses = 0;
  if (options.waitBeforeFirstPoll) {
    const remainingMs = deadline - Date.now();
    if (remainingMs > 0) {
      await abortableSleep(Math.min(intervalMs, remainingMs), options.signal, CANCEL_MESSAGE);
    }
  }
  while (Date.now() < deadline) {
    if (options.signal.aborted) {
      throw new Error(CANCEL_MESSAGE);
    }
    const result = await options.poll();
    if (result.status === "complete") {
      return result.value;
    }
    if (result.status === "failed") {
      throw new Error(result.message);
    }
    if (result.status === "slow_down") {
      slowDownResponses += 1;
      intervalMs = typeof result.intervalSeconds === "number" && Number.isFinite(result.intervalSeconds) && result.intervalSeconds > 0 ? Math.max(MINIMUM_INTERVAL_MS, Math.floor(result.intervalSeconds * 1e3)) : Math.max(MINIMUM_INTERVAL_MS, intervalMs + SLOW_DOWN_INTERVAL_INCREMENT_MS);
    }
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      break;
    }
    await abortableSleep(Math.min(intervalMs, remainingMs), options.signal, CANCEL_MESSAGE);
  }
  throw new Error(slowDownResponses > 0 ? SLOW_DOWN_TIMEOUT_MESSAGE : TIMEOUT_MESSAGE);
}

// node_modules/@earendil-works/pi-ai/dist/auth/oauth/pkce.js
function base64urlEncode(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
async function generatePKCE() {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = base64urlEncode(verifierBytes);
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const challenge = base64urlEncode(new Uint8Array(hashBuffer));
  return { verifier, challenge };
}

// node_modules/@earendil-works/pi-ai/dist/auth/oauth/openai-codex.js
var _randomBytes = null;
if (typeof process !== "undefined" && (process.versions?.node || process.versions?.bun)) {
  import("node:crypto").then((m) => {
    _randomBytes = m.randomBytes;
  });
}
var CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
var AUTH_BASE_URL = "https://auth.openai.com";
var AUTHORIZE_URL = `${AUTH_BASE_URL}/oauth/authorize`;
var TOKEN_URL = `${AUTH_BASE_URL}/oauth/token`;
var REDIRECT_URI = "http://localhost:1455/auth/callback";
var DEVICE_USER_CODE_URL = `${AUTH_BASE_URL}/api/accounts/deviceauth/usercode`;
var DEVICE_TOKEN_URL = `${AUTH_BASE_URL}/api/accounts/deviceauth/token`;
var DEVICE_VERIFICATION_URI = `${AUTH_BASE_URL}/codex/device`;
var DEVICE_REDIRECT_URI = `${AUTH_BASE_URL}/deviceauth/callback`;
var DEVICE_CODE_TIMEOUT_SECONDS = 15 * 60;
var OPENAI_CODEX_BROWSER_LOGIN_METHOD = "browser";
var OPENAI_CODEX_DEVICE_CODE_LOGIN_METHOD = "device_code";
var SCOPE = "openid profile email offline_access";
var JWT_CLAIM_PATH = "https://api.openai.com/auth";
function getCallbackHost() {
  return getProviderEnvValue("PI_OAUTH_CALLBACK_HOST") || "127.0.0.1";
}
function createState() {
  if (!_randomBytes) {
    throw new Error("OpenAI Codex OAuth is only available in Node.js environments");
  }
  return _randomBytes(16).toString("hex");
}
function parseAuthorizationInput(input) {
  const value = input.trim();
  if (!value)
    return {};
  try {
    const url = new URL(value);
    return {
      code: url.searchParams.get("code") ?? void 0,
      state: url.searchParams.get("state") ?? void 0
    };
  } catch {
  }
  if (value.includes("#")) {
    const [code, state] = value.split("#", 2);
    return { code, state };
  }
  if (value.includes("code=")) {
    const params = new URLSearchParams(value);
    return {
      code: params.get("code") ?? void 0,
      state: params.get("state") ?? void 0
    };
  }
  return { code: value };
}
function decodeJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3)
      return null;
    const payload = parts[1] ?? "";
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
async function fetchWithLoginCancellation(input, init) {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (init.signal?.aborted) {
      throw new Error("Login cancelled");
    }
    throw error;
  }
}
async function readTokenResponse(response, operation) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI Codex token ${operation} failed (${response.status}): ${text || response.statusText}`);
  }
  const rawJson = await response.json();
  const json = rawJson;
  if (!json?.access_token || !json.refresh_token || typeof json.expires_in !== "number") {
    throw new Error(`OpenAI Codex token ${operation} response missing fields: ${JSON.stringify(json)}`);
  }
  return {
    access: json.access_token,
    refresh: json.refresh_token,
    expires: Date.now() + json.expires_in * 1e3
  };
}
async function exchangeAuthorizationCode(code, verifier, redirectUri, signal) {
  const response = await fetchWithLoginCancellation(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
      code_verifier: verifier,
      redirect_uri: redirectUri
    }),
    signal
  });
  return readTokenResponse(response, "exchange");
}
async function refreshAccessToken(refreshToken, signal) {
  let response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID
      }),
      signal
    });
  } catch (error) {
    throw new Error(`OpenAI Codex token refresh error: ${error instanceof Error ? error.message : String(error)}`);
  }
  return readTokenResponse(response, "refresh");
}
async function startOpenAICodexDeviceAuth(signal) {
  const response = await fetchWithLoginCancellation(DEVICE_USER_CODE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID }),
    signal
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("OpenAI Codex device code login is not enabled for this server. Use browser login or verify the server URL.");
    }
    const responseBody = await response.text().catch(() => "");
    throw new Error(`OpenAI Codex device code request failed with status ${response.status}${responseBody ? `: ${responseBody}` : ""}`);
  }
  const rawJson = await response.json();
  const json = rawJson;
  const intervalSeconds = typeof json?.interval === "string" ? Number(json.interval.trim()) : json?.interval;
  if (!json?.device_auth_id || !json.user_code || typeof intervalSeconds !== "number" || !Number.isFinite(intervalSeconds) || intervalSeconds < 0) {
    throw new Error(`Invalid OpenAI Codex device code response: ${JSON.stringify(json)}`);
  }
  return {
    deviceAuthId: json.device_auth_id,
    userCode: json.user_code,
    intervalSeconds
  };
}
async function pollOpenAICodexDeviceAuth(device, signal) {
  return pollOAuthDeviceCodeFlow({
    intervalSeconds: device.intervalSeconds,
    expiresInSeconds: DEVICE_CODE_TIMEOUT_SECONDS,
    signal,
    poll: async () => {
      const response = await fetchWithLoginCancellation(DEVICE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_auth_id: device.deviceAuthId,
          user_code: device.userCode
        }),
        signal
      });
      if (response.ok) {
        const rawJson = await response.json();
        const json = rawJson;
        if (!json?.authorization_code || !json.code_verifier) {
          return {
            status: "failed",
            message: `Invalid OpenAI Codex device auth token response: ${JSON.stringify(json)}`
          };
        }
        return {
          status: "complete",
          value: { authorizationCode: json.authorization_code, codeVerifier: json.code_verifier }
        };
      }
      if (response.status === 403 || response.status === 404) {
        return { status: "pending" };
      }
      const responseBody = await response.text().catch(() => "");
      let errorCode;
      try {
        const json = JSON.parse(responseBody);
        const error = json?.error;
        errorCode = typeof error === "object" ? error?.code : error;
      } catch {
      }
      if (errorCode === "deviceauth_authorization_pending") {
        return { status: "pending" };
      }
      if (errorCode === "slow_down") {
        return { status: "slow_down" };
      }
      return {
        status: "failed",
        message: `OpenAI Codex device auth failed with status ${response.status}${responseBody ? `: ${responseBody}` : ""}`
      };
    }
  });
}
async function createAuthorizationFlow(originator = "pi") {
  const { verifier, challenge } = await generatePKCE();
  const state = createState();
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("scope", SCOPE);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);
  url.searchParams.set("id_token_add_organizations", "true");
  url.searchParams.set("codex_cli_simplified_flow", "true");
  url.searchParams.set("originator", originator);
  return { verifier, state, url: url.toString() };
}
function getAccountId(accessToken) {
  const payload = decodeJwt(accessToken);
  const auth = payload?.[JWT_CLAIM_PATH];
  const accountId = auth?.chatgpt_account_id;
  return typeof accountId === "string" && accountId.length > 0 ? accountId : null;
}
function credentialsFromToken(token) {
  const accountId = getAccountId(token.access);
  if (!accountId) {
    throw new Error("Failed to extract accountId from token");
  }
  return {
    type: "oauth",
    access: token.access,
    refresh: token.refresh,
    expires: token.expires,
    accountId
  };
}
async function exchangeAuthorizationCodeForCredentials(code, verifier, redirectUri, signal) {
  return credentialsFromToken(await exchangeAuthorizationCode(code, verifier, redirectUri, signal));
}
async function loginOpenAICodexDeviceCode(interaction) {
  const device = await startOpenAICodexDeviceAuth(interaction.signal);
  interaction.notify({
    type: "device_code",
    userCode: device.userCode,
    verificationUri: DEVICE_VERIFICATION_URI,
    intervalSeconds: device.intervalSeconds,
    expiresInSeconds: DEVICE_CODE_TIMEOUT_SECONDS
  });
  const code = await pollOpenAICodexDeviceAuth(device, interaction.signal);
  return exchangeAuthorizationCodeForCredentials(code.authorizationCode, code.codeVerifier, DEVICE_REDIRECT_URI, interaction.signal);
}
async function loginOpenAICodex(interaction, options) {
  const { verifier, state, url } = await createAuthorizationFlow(options?.agentName);
  const callback = await startOAuthCallbackServer({
    providerName: "OpenAI",
    host: getCallbackHost(),
    port: 1455,
    path: "/auth/callback",
    state,
    complete: async (code) => code,
    signal: interaction.signal
  }).catch(() => void 0);
  interaction.notify({
    type: "auth_url",
    url,
    instructions: "A browser window should open. Complete login to finish."
  });
  try {
    const result = await waitForCallbackOrManualInput(interaction, callback, {
      message: "Complete login in your browser, or paste the authorization code / redirect URL here:",
      placeholder: REDIRECT_URI
    });
    let code;
    if (result.type === "callback") {
      code = result.value;
    } else {
      const parsed = parseAuthorizationInput(result.input);
      if (parsed.state && parsed.state !== state)
        throw new Error("State mismatch");
      code = parsed.code;
    }
    if (!code)
      throw new Error("Missing authorization code");
    return await exchangeAuthorizationCodeForCredentials(code, verifier, REDIRECT_URI, interaction.signal);
  } finally {
    callback?.close();
  }
}
async function refreshOpenAICodexToken(refreshToken, signal) {
  return credentialsFromToken(await refreshAccessToken(refreshToken, signal));
}
var openaiCodexOAuth = {
  name: "OpenAI (ChatGPT Plus/Pro)",
  isSubscription: true,
  async login(interaction, options) {
    const method = await interaction.prompt({
      type: "select",
      message: "Select OpenAI Codex login method:",
      options: [
        { id: OPENAI_CODEX_BROWSER_LOGIN_METHOD, label: "Browser login (default)" },
        { id: OPENAI_CODEX_DEVICE_CODE_LOGIN_METHOD, label: "Device code login (headless)" }
      ]
    });
    if (method === OPENAI_CODEX_DEVICE_CODE_LOGIN_METHOD) {
      return loginOpenAICodexDeviceCode(interaction);
    }
    if (method !== OPENAI_CODEX_BROWSER_LOGIN_METHOD) {
      throw new Error(`Unknown OpenAI Codex login method: ${method}`);
    }
    return loginOpenAICodex(interaction, options);
  },
  refresh: (credential, signal) => refreshOpenAICodexToken(credential.refresh, signal),
  async toAuth(credential) {
    return { apiKey: credential.access };
  }
};

// index.ts
import { getApiProvider } from "@earendil-works/pi-ai/compat";
import { getBuiltinModels } from "@earendil-works/pi-ai/providers/all";
function index_default(pi) {
  const models = getBuiltinModels("openai-codex").map((m) => ({
    ...m,
    provider: "openai-enterprise"
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
          login: (interaction, options) => openaiCodexOAuth.login(interaction, {
            ...options,
            agentName: "codex_cli_rs"
          })
        }
      }
    })
  );
}
export {
  index_default as default
};
