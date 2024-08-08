import assert from 'node:assert';
import open from 'open';
import type { Config } from './config';

export interface InitOptions {
  config: Config;
}

export async function manage({ config }: InitOptions) {
  assert(
    config.siteId,
    'Your project isn\'t connected to a site. Please run "wix-hono init"',
  );

  console.log("Sending you to your site's dashboard...");
  open(`https://manage.wix.com/dashboard/${config.siteId}`);
}
