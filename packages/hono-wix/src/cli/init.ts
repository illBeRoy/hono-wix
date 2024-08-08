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

  const { createNewSite } = await prompts({
    name: 'createNewSite',
    type: 'select',
    message: 'What do you want to do?',
    choices: [
      {
        title: 'Create new site for this project',
        description: 'this will take you to wix.com to create a new site',
        value: true,
      },
      {
        title: 'Use an existing site',
        description: 'choose from a list of your sites',
        value: false,
      },
    ],
  });

  if (createNewSite) {
    console.log(
      "We're taking you to wix.com to create a new site. Once created, come back and continue this wizard.",
    );
    open('https://www.wix.com/studio/templates');

    const { shouldContinue } = await prompts({
      name: 'shouldContinue',
      type: 'confirm',
      message: 'Have your created your new Wix site?',
      initial: true,
    });

    assert(shouldContinue, 'User aborted the onboarding process');
  }

  const sites = await getSitesList();
  if (sites.length === 0) {
    console.log(
      'You do not have any sites connected to your Wix account yet.\n' +
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
