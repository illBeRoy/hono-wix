#!/usr/bin/env node
import assert from 'node:assert';
import { parseArgs } from 'node:util';
import { loadConfig } from './config';
import { init } from './init';
import { build } from './build';
import { publish } from './publish';
import { manage } from './manage';

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
    case 'manage': {
      await manage({ config });
      break;
    }
    case 'publish': {
      await publish({ config });
      break;
    }
    default: {
      throw new Error(`Unrecognized command: ${cmd}`);
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
  });
}
