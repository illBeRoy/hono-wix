#!/usr/bin/env node
import assert from 'node:assert';
import { parseArgs } from 'node:util';
import { build } from './build';
import { loadConfig } from './config';
import { init } from './init';

async function main() {
  const args = parseArgs({
    allowPositionals: true,
  });

  const [cmd] = args.positionals;
  assert(cmd, 'No command passed');

  const config = await loadConfig();

  switch (cmd) {
    case 'init': {
      await init({ config });
      break;
    }
    case 'build': {
      await build({ config });
      break;
    }
    default: {
      throw new Error(`Unrecognized command: ${cmd}`);
    }
  }
}

if (require.main === module) {
  main().catch((err) => console.error(err));
}
