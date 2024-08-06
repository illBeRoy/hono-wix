import { describe, it } from 'node:test';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert';

describe('wix-hono build', () => {
  it('should build an entire project into the files that can be uploaded to Wix', async () => {
    await using projectDir = await createTempProjectDirFromFixture(
      'projects/fullProject',
    );

    runCli(projectDir.path, 'build');

    const httpFnsFile = path.join(projectDir.path, 'dist', 'http-functions.js');
    const honoFile = path.join(projectDir.path, 'dist', '__hono.js');

    assert((await fs.readFile(httpFnsFile, 'utf-8')).includes('get_hello'));
    assert((await fs.readFile(honoFile, 'utf-8')).includes('app.get("/hello"'));
  });
});

const createTempProjectDirFromFixture = async (fixtureName: string) => {
  const fixtureDir = path.join(__dirname, '..', 'fixtures', fixtureName);
  const tempDir = path.join(
    os.tmpdir(),
    `test_wix_hono_${Math.random().toString(16).split('.').pop()}`,
  );

  await fs.cp(fixtureDir, tempDir, { recursive: true });

  return {
    path: tempDir,
    async [Symbol.asyncDispose]() {
      return fs.rm(tempDir, { recursive: true, force: true });
    },
  };
};

const runCli = (cwd: string, command: string) => {
  const tsxPath = path.join(path.dirname(require.resolve('tsx')), 'cli.mjs');
  const cliPath = path.join(__dirname, '..', '..', 'src', 'cli', 'index.ts');
  const cmd = `${tsxPath} ${cliPath} ${command}`;
  return execSync(cmd, { cwd });
};
