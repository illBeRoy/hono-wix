import { AsyncLocalStorage } from 'node:async_hooks';
import { createMiddleware } from 'hono/factory';
import { createClient } from '@wix/sdk';
import { setGlobalWixContext } from '@wix/sdk/context';

const authStorage = new AsyncLocalStorage<{ auth?: string }>();

export const wixSdk = () => {
  setGlobalWixContext(
    {
      initWixModules(wixModules, _elevated) { //eslint-disable-line
        const wixClient = createClient({
          auth: {
            getAuthHeaders() {
              const data = authStorage.getStore();

              if (!data) {
                throw new Error(
                  'Please use Wix SDK within a request context to identify the requester.\n' +
                    'If running independently, consider using "elevate" with caution, as it grants admin access.',
                );
              }

              const { auth } = data;

              if (auth) {
                return {
                  headers: {
                    Authorization: auth,
                  },
                };
              } else {
                return { headers: {} as Record<string, string> };
              }
            },
          },
        });

        return wixClient.use(wixModules) as any; //eslint-disable-line
      },
    },
    { dangerouslyOverride: true },
  );

  return createMiddleware(async (c, next) => {
    const auth = c.req.header('authorization');
    await authStorage.run(auth ? { auth } : {}, next);
  });
};
