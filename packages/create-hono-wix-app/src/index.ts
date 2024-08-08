#!/usr/bin/env node
import assert from 'node:assert';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import prompts from 'prompts';

const PKG_MANAGERS = ['npm', 'yarn', 'pnpm'] as const;
type PackageManager = (typeof PKG_MANAGERS)[number];

async function main() {
  const {
    appName,
    pkgManager,
  }: { appName: string; pkgManager: PackageManager } = await prompts([
    {
      name: 'appName',
      type: 'text',
      message:
        'What to call your new app? (this will also be the name of the package and the directory)',
      initial: 'my-wix-hono-app',
      validate: (text) =>
        /^[a-z]+(-[a-z]+)*$/.test(text) ||
        'Please make sure that your app name is all lower case with dashes',
    },
    {
      name: 'pkgManager',
      type: 'select',
      message: 'What package manager to use?',
      choices: PKG_MANAGERS.map((pkgMngr) => ({
        title: pkgMngr,
        value: pkgMngr,
      })),
    },
  ]);

  assert(appName, 'No app name was provided. Aborting');
  assert(
    PKG_MANAGERS.includes(pkgManager),
    'No package manager was selected. Aborting',
  );

  const templatePath = path.join(__dirname, '..', 'template');
  const appPath = path.join(process.cwd(), appName);

  assert(
    !existsSync(appPath),
    `Directory called ${appName} already exists in the current path. Aborting...`,
  );

  await fs.cp(templatePath, appPath, { recursive: true });

  const pkgJsonPath = path.join(appPath, 'package.json');
  const pkgJson = await fs.readFile(pkgJsonPath, 'utf-8');

  await fs.writeFile(pkgJsonPath, pkgJson.replace('{{appName}}', appName));

  const installCommands: Record<PackageManager, string> = {
    npm: 'npm install',
    yarn: 'yarn',
    pnpm: 'pnpm install',
  };

  execSync(installCommands[pkgManager], { cwd: appPath, stdio: 'inherit' });

  const initCommands: Record<PackageManager, string> = {
    npm: 'npx hono-wix init',
    yarn: 'yarn hono-wix init',
    pnpm: 'pnpm exec hono-wix init',
  };

  execSync(initCommands[pkgManager], { cwd: appPath, stdio: 'inherit' });

  const runCommands: Record<PackageManager, (scriptName: string) => string> = {
    npm: (s) => `npm run ${s}`,
    yarn: (s) => `yarn ${s}`,
    pnpm: (s) => `pnpm run ${s}`,
  };

  console.log('Done!');
  console.log('');
  console.log('You can find your project at:', appPath);
  console.log('');
  console.log('Get started with one of the following commands:');
  console.log(
    `  ${runCommands[pkgManager]('dev')} - start your dev server locally`,
  );
  console.log(`  ${runCommands[pkgManager]('test')} - test your server`);
  console.log(`  ${runCommands[pkgManager]('build')} - build your project`);
  console.log(
    `  ${runCommands[pkgManager]('publish')} - deploy your server to your Wix site`,
  );
  console.log(
    `  ${runCommands[pkgManager]('manage')} - manage your Wix site on wix.com`,
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
  });
}
