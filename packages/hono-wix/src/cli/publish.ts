import assert from 'node:assert';
import path from 'node:path';
import prompts from 'prompts';
import { build } from './build';
import { deployApp } from './wixApi';
import type { Config } from './config';

export interface PublishOptions {
  config: Config;
}

export async function publish({ config }: PublishOptions) {
  assert(
    config.siteId,
    'Your project isn\'t connected to a site. Please run "wix-hono init"',
  );

  const { shouldBuild } = await prompts({
    message: `Should we build the project? (out dir: "${config.outDir}")`,
    type: 'confirm',
    name: 'shouldBuild',
    initial: true,
  });

  if (shouldBuild) {
    await build({ config });
  }

  const deployment = await deployApp(config.siteId, {
    'backend/http-functions.js': {
      fromPath: path.join(config.outDir, 'http-functions.js'),
    },
    'backend/__hono.js': {
      fromPath: path.join(config.outDir, '__hono.js'),
    },
    'styles/noop.css': { fromContent: '/* ok */' },
    'public/pages/masterPage.js': { fromContent: '// ok' },
  });

  const httpFnsUrl = new URL(deployment.deploymentUrl);
  httpFnsUrl.pathname = path.join(httpFnsUrl.pathname, '_functions');

  console.log('Success!');
  console.log(`Your app is live at: ${httpFnsUrl}`);
}
