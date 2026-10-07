// Worker-safe replacement for @vercel/oidc (pulled in by the "ai" package via
// @ai-sdk/gateway). The real package reads node:fs/os/path through createRequire,
// which crashes the published Worker at startup. We never use Vercel OIDC: AI calls
// go through the Lovable AI Gateway with an API key.
export class AccessTokenMissingError extends Error {}
export class RefreshAccessTokenFailedError extends Error {}
export function getContext(): Record<string, unknown> {
  return {};
}
export async function getVercelOidcToken(): Promise<string> {
  return "";
}
export function getVercelOidcTokenSync(): string {
  return "";
}
export async function getVercelToken(): Promise<string> {
  throw new Error("getVercelToken is not supported");
}
