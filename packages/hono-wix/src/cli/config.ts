import { load } from '@npmcli/package-json';

export type Config = typeof config;

export const config = {
  outDir: 'dist',
  siteId: '',
};

export async function loadConfig(): Promise<Config> {
  const pkgJson = await load(process.cwd());
  const conf =
    typeof pkgJson.content.wix === 'object' &&
    !(pkgJson.content.wix instanceof Array)
      ? (pkgJson.content.wix ?? {})
      : {};

  return {
    ...config,
    ...(typeof conf.outDir === 'string' ? { outDir: conf.outDir } : {}),
    ...(typeof conf.siteId === 'string' ? { siteId: conf.siteId } : {}),
  };
}

export async function setConfigKey<TKey extends keyof Config>(
  key: TKey,
  value: Config[TKey],
) {
  const pkgJson = await load(process.cwd());
  await pkgJson
    .update({
      wix: {
        ...(typeof pkgJson.content.wix === 'object' ? pkgJson.content.wix : {}),
        [key]: value,
      },
    })
    .save();
}
