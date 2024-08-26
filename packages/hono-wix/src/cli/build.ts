import fs from 'node:fs/promises';
import assert from 'node:assert';
import path from 'node:path';
import { load } from '@npmcli/package-json';
import * as tsup from 'tsup';
import type { Config } from './config';

export interface BuildOptions {
  config: Config;
}

export interface BuildEntrypointOptions {
  config: Config;
}

async function buildEntrypoint({ config }: BuildEntrypointOptions) {
  const entrypointTemplatePath = path.join(
    __dirname,
    '..',
    '..',
    'assets',
    'entrypoint.js.template',
  );

  const template = await fs.readFile(entrypointTemplatePath, 'utf-8');

  return template.replace('{{PREFIX}}', config.prefix);
}

export async function build({ config }: BuildOptions) {
  const pkgJson = await load(process.cwd());

  assert(
    pkgJson.content.main,
    'please add a "main" property to your package.json that points at the entrypoint of your app',
  );

  const httpFnsFile = await buildEntrypoint({
    config,
  });

  const outDir = path.join(process.cwd(), config.outDir);

  await fs.mkdir(outDir, { recursive: true });

  await fs.writeFile(
    path.join(process.cwd(), config.outDir, 'http-functions.js'),
    httpFnsFile,
  );

  await tsup.build({
    entry: { __hono: pkgJson.content.main },
    outDir: config.outDir,
    format: 'esm',
    target: 'es2020',
    splitting: false,
    outExtension() {
      return { js: '.js', dts: '.d.ts' };
    },
    noExternal: [/.*/],
  });
}
