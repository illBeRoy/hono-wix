import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import assert from 'node:assert';

const authDir = path.join(os.homedir(), '.wix', 'auth');

export interface WixIdentity {
  accessToken: string;
  refreshToken: string;
  issuedAt: number;
  expiresIn: number;
  userInfo?: {
    userId: string;
    email: string;
  };
}

export const getAccountIdentity = async () => {
  const file = 'account.json';

  const identity = await readIdentityFromFile(file);

  const isExpired =
    Date.now() > (identity.issuedAt + identity.expiresIn) * 1000;

  if (isExpired) {
    const refreshRes = await fetch('https://manage.wix.com/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: identity.accessToken,
      },
      body: JSON.stringify({
        clientId: '6f95cec8-3e98-48b9-b4e5-1fb92fcd9973',
        grantType: 'refresh_token',
        scope: 'offline_access',
        refreshToken: identity.refreshToken,
      }),
    });

    assert.equal(
      refreshRes.status,
      200,
      `Could not refresh auth with Wix. Please try logging out and back in again. (status: ${refreshRes.status})`,
    );

    const refreshJson = await refreshRes.json();
    identity.accessToken = refreshJson.access_token;
    identity.refreshToken = refreshJson.refresh_token;
    identity.issuedAt = Math.floor(Date.now() / 1000);
    identity.expiresIn = refreshJson.expires_in;

    await writeIdentityToFile(file, identity);
  }

  return identity;
};

export const getSiteIdentity = async (siteId: string) => {
  const file = `site.${siteId}.json`;

  const siteIdentity = await readIdentityFromFile(file).catch(() => null);

  const canUseExistingSiteIdentity =
    siteIdentity &&
    Date.now() < (siteIdentity.issuedAt + siteIdentity.expiresIn) * 1000;

  if (canUseExistingSiteIdentity) {
    return siteIdentity;
  }

  const accountIdentity = await getAccountIdentity();
  const refreshRes = await fetch('https://manage.wix.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: accountIdentity.accessToken,
    },
    body: JSON.stringify({
      clientId: '6f95cec8-3e98-48b9-b4e5-1fb92fcd9973',
      grantType: 'refresh_token',
      scope: 'offline_access',
      refreshToken: accountIdentity.refreshToken,
      siteId,
    }),
  });

  assert.equal(
    refreshRes.status,
    200,
    `Could not refresh auth with Wix. Please try logging out and back in again. (status: ${refreshRes.status})`,
  );

  const refreshJson = await refreshRes.json();
  const newSiteIdentity: WixIdentity = {
    accessToken: refreshJson.access_token,
    refreshToken: refreshJson.refresh_token,
    issuedAt: Math.floor(Date.now() / 1000),
    expiresIn: refreshJson.expires_in,
  };

  await writeIdentityToFile(file, newSiteIdentity);

  return newSiteIdentity;
};

export const readIdentityFromFile = async (
  filename: string,
): Promise<WixIdentity> => {
  const file = path.join(authDir, filename);

  const identity: WixIdentity = JSON.parse(
    await fs.readFile(file, 'utf-8').catch(() => {
      throw new Error('No Wix identity found on this machine');
    }),
  );

  assert(
    typeof identity.accessToken === 'string' &&
      typeof identity.refreshToken === 'string' &&
      typeof identity.issuedAt === 'number' &&
      typeof identity.expiresIn === 'number' &&
      (!identity.userInfo ||
        (typeof identity.userInfo.email === 'string' &&
          typeof identity.userInfo.userId === 'string')),
    'Could not find wix identity on this machine. Please login first.',
  );

  return identity;
};

export const writeIdentityToFile = async (
  filename: string,
  identity: WixIdentity,
): Promise<void> => {
  const file = path.join(authDir, filename);

  await fs.writeFile(file, JSON.stringify(identity));
};
