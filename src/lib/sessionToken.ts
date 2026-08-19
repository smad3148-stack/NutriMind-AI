/**
 * Shared holder for the current session access token (P0-04).
 *
 * Non-React modules (analytics, crash reporter) need to attach the bearer
 * token to authenticated endpoints (/api/diagnostics/*, /api/user/push-token)
 * but cannot access React state. App.tsx pushes the token here on every
 * session change; in sandbox/demo mode it is undefined and requests are sent
 * without an Authorization header (the server sandbox path allows them).
 */

let sessionToken: string | undefined;

export function setSessionToken(token: string | undefined): void {
  sessionToken = token;
}

export function getSessionToken(): string | undefined {
  return sessionToken;
}
