#!/usr/bin/env node
import assert from 'node:assert';
import { parseArgs } from 'node:util';
import { build } from './build';
import { config } from './config';

async function main() {
  const args = parseArgs({
    allowPositionals: true,
  });

  const [cmd] = args.positionals;
  assert(cmd, 'No command passed');

  switch (cmd) {
    case 'build': {
      await build({ config });
      break;
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}
