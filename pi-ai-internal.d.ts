// Type declarations for pi-ai internal modules resolved by esbuild at build time.

declare module "@earendil-works/pi-ai/dist/auth/oauth/openai-codex.js" {
  import type { OAuthCredentials } from "@earendil-works/pi-ai/oauth";

  interface OAuthCredential extends OAuthCredentials {
    type: "oauth";
  }

  export const openaiCodexOAuth: {
    name: string;
    isSubscription: boolean;
    login(
      interaction: unknown,
      options?: { agentName?: string },
    ): Promise<OAuthCredential>;
    refresh(
      credential: OAuthCredential,
      signal: AbortSignal,
    ): Promise<OAuthCredential>;
    toAuth(credential: OAuthCredential): Promise<{ apiKey: string }>;
  };
}
