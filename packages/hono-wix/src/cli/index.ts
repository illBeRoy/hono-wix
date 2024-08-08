#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { loadConfig } from './config';
import { init } from './init';
import { build } from './build';
import { publish } from './publish';
import { manage } from './manage';

const Commands = {
  Init: { cmd: 'init', description: 'Connect your project to a Wix site' },
  Build: {
    cmd: 'build',
    description: 'Build your code and prepare it for upload',
  },
  Publish: {
    cmd: 'publish',
    description: 'Publish your code to production and go live',
  },
  Manage: {
    cmd: 'manage',
    description:
      "Open your site's dashboard to manage databases, settings, integrations, and more",
  },
} satisfies Record<string, { cmd: string; description: string }>;

async function main() {
  const args = parseArgs({
    allowPositionals: true,
  });

  const [cmd] = args.positionals;

  const config = await loadConfig();

  switch (cmd) {
    case Commands.Init.cmd: {
      await init({ config });
      break;
    }
    case Commands.Build.cmd: {
      await build({ config });
      break;
    }
    case Commands.Publish.cmd: {
      await publish({ config });
      break;
    }
    case Commands.Manage.cmd: {
      await manage({ config });
      break;
    }
    default: {
      console.log('List of available commands:');
      Object.values(Commands).forEach((cmd) =>
        console.log(`  ${cmd.cmd} - ${cmd.description}`),
      );
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
  });
}
