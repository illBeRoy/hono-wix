import { load } from '@npmcli/package-json';

export type Config = typeof defaultConfig;

export const defaultConfig = {
  outDir: 'dist',
  siteId: '',
  prefix: 'api',
};

export async function loadConfig(): Promise<Config> {
  const pkgJson = await load(process.cwd());
  const conf =
    typeof pkgJson.content.wix === 'object' &&
    !(pkgJson.content.wix instanceof Array)
      ? (pkgJson.content.wix ?? {})
      : {};

  return {
    ...defaultConfig,
    ...(typeof conf.outDir === 'string' ? { outDir: conf.outDir } : {}),
    ...(typeof conf.siteId === 'string' ? { siteId: conf.siteId } : {}),
    ...(typeof conf.prefix === 'string' ? { siteId: conf.prefix } : {}),
  };
}

export async function setConfigKey<TKey extends keyof Config>(
  key: TKey,
  value: Exclude<Config[TKey], undefined>,
) {
  const pkgJson = await load(process.cwd());
  await pkgJson
    .update({
      wix: {
        ...(pkgJson.content.wix && typeof pkgJson.content.wix === 'object'
          ? pkgJson.content.wix
          : {}),
        [key]: value,
      },
    })
    .save();
}
