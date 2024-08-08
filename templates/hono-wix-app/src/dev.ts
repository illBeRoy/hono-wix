import { serve } from '@hono/node-server';
import app from './index';

const port = parseInt(process.env.PORT ?? '', 10) || 3000;

serve({ port, fetch: app.fetch }).on('listening', () =>
  console.log(`[DEV SERVER] Listening on port ${port}`),
);
