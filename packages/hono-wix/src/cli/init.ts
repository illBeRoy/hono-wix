import assert from 'node:assert';
import { Config, setConfigKey } from './config';
import { getSitesList, login, turnOnSiteDevMode, whoAmI } from './wixApi';
import prompts from 'prompts';

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
    choices: sites.map((site) => ({ value: site.id, title: site.displayName })),
  });

  assert(selectedSite, 'No site was selected. Aborting...');

  await turnOnSiteDevMode(selectedSite);

  setConfigKey('siteId', selectedSite);

  console.log(
    'Congratulations! Your project is now connectd to your Wix site.',
  );
}
