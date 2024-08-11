import fs from 'node:fs/promises';
import { serve } from '@hono/node-server';
import app from './index';

app.get('/', async (c) =>
  c.html(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Welcome to Hono Wix Dev Server</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown.min.css" />
    </head>
    <body>
      <div id="content" class="markdown-body"></div>
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <script>
        document.getElementById('content').innerHTML =
          marked.parse(${JSON.stringify(await fs.readFile('README.md', 'utf8'))});
      </script>
    </body>
    </html>
  `),
);

const port = parseInt(process.env.PORT ?? '', 10) || 3000;

serve({ port, fetch: app.fetch }).on('listening', () =>
  console.log(`[DEV SERVER] Listening on port ${port}`),
);
