import assert from 'node:assert';
import prompts from 'prompts';
import open from 'open';
import { Config, setConfigKey } from './config';
import { getSitesList, login, turnOnSiteDevMode, whoAmI } from './wixApi';

export interface InitOptions {
  config: Config;
}

export async function init({ config }: InitOptions) {
  if (config.siteId) {
    console.log('Your project is already connected to a site.');
    console.log(
      `You can visit your site's dashboard at: https://manage.wix.com/dashboard/${config.siteId}`,
    );
    return;
  }

  const me = whoAmI();
  if (!me) {
    const isLoggedIn = login();
    assert(
      isLoggedIn,
      'You must be logged in in order to connect this project to a Wix site',
    );
  }

  const sites = await getSitesList();
  if (sites.length === 0) {
    console.log(
      'You do not have existing wix sites yet.\n' +
        'Get started at: https://manage.wix.com',
    );
    return;
  }

  const { selectedSite } = await prompts({
    name: 'selectedSite',
    type: 'select',
    message: 'Choose a Wix site to link to your project',
    choices: [
      {
        title: 'Create new site',
        value: '<NEW>',
        description:
          'go to wix.com to create a new site and connect it to your project',
      },
      { title: '------', disabled: true },
      ...sites.map((site) => ({ value: site.id, title: site.displayName })),
    ],
  });

  assert(selectedSite, 'No site was selected. Aborting...');

  if (selectedSite === '<NEW>') {
    console.log(
      'Sending you to wix.com to create a new site. Once created, run "hono-wix init" once again, and select the newly created site.',
    );
    open('https://manage.wix.com');
    return;
  }

  await turnOnSiteDevMode(selectedSite);

  setConfigKey('siteId', selectedSite);

  console.log(
    'Congratulations! Your project is now connectd to your Wix site.',
  );
}
