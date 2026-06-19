// Trakt OAuth2 + sync adapter (Phase 3 stub per design.md roadmap).
// Implemented as a typed seam now so the UI and ranking layers can integrate
// it later without touching call sites elsewhere in the app.

export interface TraktAuthConfig {
  clientId: string;
  redirectUri: string;
}

function getAuthorizeUrl(config: TraktAuthConfig): string {
  const url = new URL('https://trakt.tv/oauth/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  return url.toString();
}

async function isConnected(): Promise<boolean> {
  return false;
}

export const traktAdapter = {
  getAuthorizeUrl,
  isConnected,
};
