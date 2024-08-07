import fs from 'node:fs/promises';
import assert from 'node:assert';
import path from 'node:path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { load } from '@npmcli/package-json';
import * as tsup from 'tsup';
import type { Config } from './config';

export interface BuildOptions {
  config: Config;
}

export interface BuildEntrypointOptions {
  srcFile: string;
  config: Config;
}

export async function buildEntrypoint({
  srcFile,
}: BuildEntrypointOptions): Promise<string> {
  // run static analysis over the code
  const src = await fs.readFile(srcFile, 'utf-8');
  const ast = parse(src, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  let honoAppVarName = '';
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      assert(
        path.node.declaration.type === 'Identifier',
        'default export from project entrypoint must be the Hono app, usually in the form of:\n"export default app;"',
      );
      honoAppVarName = path.node.declaration.name;
    },
  });

  assert(honoAppVarName, 'no default export found in the entrypoint file');

  // ensure app was created in the entrypoint file
  traverse(ast, {
    ImportSpecifier(path) {
      assert(
        path.node.local.name !== honoAppVarName,
        'the hono app must be created locally in the entrypoint file',
      );
    },
    ImportDefaultSpecifier(path) {
      assert(
        path.node.local.name !== honoAppVarName,
        'the hono app must be created locally in the entrypoint file',
      );
    },
    ImportNamespaceSpecifier(path) {
      assert(
        path.node.local.name !== honoAppVarName,
        'the hono app must be created locally in the entrypoint file',
      );
    },
  });

  const routes: { method: string; path: string }[] = [];
  traverse(ast, {
    MemberExpression(path) {
      // ensure this is hono
      if (path.node.object.type !== 'Identifier') {
        return;
      }

      if (path.node.object.name !== honoAppVarName) {
        return;
      }

      // ensure this is one of the supported HTTP methods
      if (path.node.property.type !== 'Identifier') {
        return;
      }

      assert(
        !['patch', 'head', 'options', 'connect', 'trace'].includes(
          path.node.property.name,
        ),
        'the following http methods are not yet supported: "PATCH", "HEAD", "OPTIONS", "CONNECT", "TRACE". please refrain from using them.',
      );

      if (!['get', 'post', 'put', 'delete'].includes(path.node.property.name)) {
        return;
      }

      const method = path.node.property.name;

      // go to parent and ensure it's a call expression
      const callExp = path.parent;
      if (callExp.type !== 'CallExpression') {
        return;
      }

      // get the first parameter
      const firstParam = callExp.arguments[0];

      // assert that it is a string literal
      assert(
        firstParam.type === 'StringLiteral',
        'since the Wix platform uses static path resolution, the path for a route must be a string literal and cannot be a variable',
      );

      const pathWithoutLeadingSlash = firstParam.value.startsWith('/')
        ? firstParam.value.slice(1)
        : firstParam.value;

      assert(
        !pathWithoutLeadingSlash.includes('*'),
        'since the Wix platform uses static path resolution, dynamic paths using wildcards (*) are not supported',
      );

      assert(
        !pathWithoutLeadingSlash.includes('/'),
        'the Wix platform does not currently support nested paths (/a/b)',
      );

      assert(
        !pathWithoutLeadingSlash.includes(':'),
        'since the Wix platform uses static path resolution, path parameters (/:id) are not supported',
      );

      routes.push({ method, path: pathWithoutLeadingSlash });
    },
  });

  return (
    'import app from "./__hono";\n\n' +
    (await fs.readFile(
      path.join(__dirname, '..', '..', 'assets', 'runtime.js'),
    )) +
    '\n' +
    routes
      .map(
        (route) =>
          `export function ${route.method}_${route.path}(request) {\n` +
          '  return handleRequest(app, request);\n' +
          '}',
      )
      .join('\n\n')
  );
}

export async function build({ config }: BuildOptions) {
  const pkgJson = await load(process.cwd());

  assert(
    pkgJson.content.main,
    'please add a "main" property to your package.json that points at the entrypoint of your app',
  );

  const httpFnsFile = await buildEntrypoint({
    srcFile: pkgJson.content.main,
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
    outExtension() {
      return { js: '.js', dts: '.d.ts' };
    },
    noExternal: [/.*/],
  });
}
