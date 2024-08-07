import { execSync } from 'node:child_process';
import { createClient } from '@wix/sdk';
import { getAccountIdentity, getSiteIdentity } from './identity';

export function whoAmI(): string | null {
  const output = execSync('npx wix whoami', { stdio: 'pipe' })
    .toString()
    .trim();

  const matches = output.match(/^Logged in as (?<user>.+)$/);
  if (matches?.groups?.user) {
    return matches.groups.user;
  } else {
    return null;
  }
}

export function login(): boolean {
  execSync('npx wix login', { stdio: 'inherit' });
  return !!whoAmI();
}

export async function getSitesList() {
  const url = 'https://manage.wix.com/_api/sites-list/v2/sites/query';
  const method = 'POST';

  type Site = {
    id: string;
    displayName: string;
  };

  type QuerySitesResponse = {
    sites?: Site[];
  };

  const client = await createClientWithAuth();
  const res = await client.fetchWithAuth(url, { method });
  const json: QuerySitesResponse = await res.json();

  return json.sites ?? [];
}

export async function turnOnSiteDevMode(siteId: string) {
  const url =
    'https://manage.wix.com/_api/wix-code-lifecycle-service/v1/provision';
  const method = 'POST';

  const client = await createClientWithAuth(siteId);

  const res = await client.fetchWithAuth(url, { method, body: '{}' });

  if (res.status !== 200) {
    throw new Error(
      `Failed to provision your site! (status: ${res.status}; requestId: ${res.headers.get('x-wix-request-id')})`,
    );
  }
}

const createClientWithAuth = async (siteId?: string) => {
  const identity = siteId
    ? await getSiteIdentity(siteId)
    : await getAccountIdentity();

  return createClient({
    auth: {
      getAuthHeaders() {
        const headers: Record<string, string> = {};

        headers.Authorization = identity.accessToken;

        return { headers };
      },
    },
  });
};
