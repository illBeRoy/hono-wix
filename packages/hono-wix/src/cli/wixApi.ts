import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { createClient } from '@wix/sdk';
import { getAccountIdentity, getSiteIdentity } from './identity';
import assert from 'node:assert';

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

export async function deployApp(
  siteId: string,
  files: Record<string, { fromPath: string } | { fromContent: string }>,
) {
  const url =
    'https://manage.wix.com/_api/wix-code-lifecycle-service/v1/apps/deploy';
  const method = 'POST';

  const client = await createClientWithAuth(siteId);

  const siteRevision: string | null = await client
    .fetchWithAuth(
      'https://manage.wix.com/wix-html-editor-revisions-webapp/v1/site-revisions',
      { method: 'POST', body: JSON.stringify({ paging: { limit: 1 } }) },
    )
    .then((res) => res.json())
    .then((json) => json.siteRevisions?.[0]?.revision)
    .catch(() => null);

  assert(
    siteRevision,
    `Unable to determine the live state of your Wix site. Did you maybe delete it?`,
  );

  const res = await client.fetchWithAuth(url, {
    method,
    body: JSON.stringify({
      deploymentOperation: 'GA',
      appType: 'VELO_ISOLATED',
      deploymentData: {
        revision: siteRevision,
        content: {
          ignoreForbiddenPaths: true,
          layout: 'ONLINE',
          files: Object.entries(files).map(([targetFilePath, srcFile]) => ({
            path: targetFilePath,
            content:
              'fromPath' in srcFile
                ? fs.readFileSync(srcFile.fromPath, 'utf-8')
                : srcFile.fromContent,
          })),
        },
      },
    }),
  });

  assert.equal(
    res.status,
    200,
    `Failed to deploy to Wix. (status: ${res.status}; requestId: ${res.headers.get('x-wix-request-id')}`,
  );

  const json = await res.json();
  return json.deploymentInfo as {
    deploymentId: string;
    deploymentUrl: string;
    deployedRevision: string;
    deploymentShortUrl?: string;
    isPublishPipelineDeployment: boolean;
  };
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
