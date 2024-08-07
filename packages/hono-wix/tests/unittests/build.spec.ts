import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import { buildEntrypoint } from '../../src/cli/build';
import { config } from '../../src/cli/config';

describe('Build a compatible http-functions.js file', () => {
  const fixture = (name: string) =>
    path.join(__dirname, '..', 'fixtures', name);

  describe('building the entrypoint', () => {
    it('should import the hono app', async () => {
      const out = await buildEntrypoint({
        srcFile: fixture('basic.js'),
        config,
      });

      assert(out.includes('import app from "./__hono";'));
    });

    it('should contain the runtime', async () => {
      const out = await buildEntrypoint({
        srcFile: fixture('basic.js'),
        config,
      });

      assert(out.includes('async function handleRequest(app, request)'));
    });

    it('should proxy requests into the hono app', async () => {
      const out = await buildEntrypoint({
        srcFile: fixture('basic.js'),
        config,
      });

      assert(
        out.includes(
          'export function get_hello(request) {\n' +
            '  return handleRequest(app, request);\n' +
            '}',
        ),
      );
    });

    it('should create proxy functions for all registered routes', async () => {
      const out = await buildEntrypoint({
        srcFile: fixture('multipleRoutes.js'),
        config,
      });

      assert(out.includes('export function get_hello(request) {'));
      assert(out.includes('export function post_hey(request) {'));
      assert(out.includes('export function put_hi(request) {'));
      assert(out.includes('export function delete_aloha(request) {'));
    });

    it('should not mistakenly register routes (see file for elaboration)', async () => {
      const out = await buildEntrypoint({
        srcFile: fixture('notARoute.js'),
        config,
      });

      assert(!out.includes('export function get_'));
    });

    it('should require that the app is created in the entrypoint', async () => {
      const out = buildEntrypoint({
        srcFile: fixture('importedApp.js'),
        config,
      });

      await assert.rejects(out);
    });

    describe('invalid routes', () => {
      it('should throw if the hono app uses a route that is not a string literal', async () => {
        const out = buildEntrypoint({
          srcFile: fixture('notAStringLiteral.js'),
          config,
        });

        await assert.rejects(out);
      });

      it('should throw if the hono app uses an HTTP method that is not supported by Wix', async () => {
        const out = buildEntrypoint({
          srcFile: fixture('unsupportedHttpMethods.js'),
          config,
        });

        await assert.rejects(out);
      });

      it('should throw if any path uses a wildcard', async () => {
        const out = buildEntrypoint({
          srcFile: fixture('pathWithWildcard.js'),
          config,
        });

        await assert.rejects(out);
      });

      it('should throw if there are nested paths', async () => {
        const out = buildEntrypoint({
          srcFile: fixture('nestedPath.js'),
          config,
        });

        await assert.rejects(out);
      });

      it('should throw if there are path parameters', async () => {
        const out = buildEntrypoint({
          srcFile: fixture('pathParameters.js'),
          config,
        });

        await assert.rejects(out);
      });
    });

    describe('typescript', () => {
      it('should support typescript input', async () => {
        const out = await buildEntrypoint({
          srcFile: fixture('basic.ts'),
          config,
        });

        assert(
          out.includes(
            'function get_hello(request) {\n' +
              '  return handleRequest(app, request);\n' +
              '}',
          ),
        );
      });
    });
  });
});
