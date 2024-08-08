# hono-wix-app

Congratulations on creating your Hono ❤️ Wix app!

You now have a [Hono.dev](https://hono.dev) application connected to your Wix site. This integration gives you the best of both worlds:
1. Work on your standard Hono application, including running it locally, testing it, and using any Hono integrations you like.
2. Benefit from Wix's Headless (BaaS) solution: database, object storage, and various business solutions such as the ecom platform, blogging platform, bookings, and more.

## Get Started with Your App
Begin with [src/index.ts](src/index.ts), where you can find your Hono app.

Write your first test at [tests/app.spec.ts](tests/app.spec.ts).

Use the following npm scripts to manage your app:
- `dev` - Start your dev server locally
- `test` - Test your server
- `build` - Build your project
- `publish` - Deploy your server to your Wix site
- `manage` - Manage your Wix site on wix.com

## Learn About Wix Headless
The Wix Headless platform lets you enjoy all the benefits of a Wix site in the form of a BaaS (backend as a service). This includes:
- Your own database using [Wix Data](https://dev.wix.com/docs/sdk/backend-modules/data/introduction)
- Complete storefront & ecommerce solution using [Wix Stores](https://dev.wix.com/docs/sdk/backend-modules/ecom/introduction)
- User authentication, login & membership management using [Wix Members](https://dev.wix.com/docs/sdk/backend-modules/members/members/introduction)
- Files and media storage using [Wix Media](https://dev.wix.com/docs/sdk/backend-modules/media/introduction)
- Booking, scheduling & calendar services using [Wix Bookings](https://dev.wix.com/docs/sdk/backend-modules/bookings/introduction)
- Blog, articles & newsfeed solution using [Wix Blogs](https://dev.wix.com/docs/sdk/backend-modules/blog/introduction)
- Numerous other integrations available on the [Wix App Market](https://www.wix.com/app-market)

To manage the integrations on your Wix site, run `npm run manage` or `yarn manage` to access your site's dashboard in the browser.

Learn more about the Wix APIs & the Wix SDK on [dev.wix.com](https://dev.wix.com/docs/sdk).

### Using the Wix SDK
To use any of the above features, you need the [Wix SDK](https://dev.wix.com/docs/sdk).

Start by installing the SDK:
```sh
npm install @wix/sdk
```
or
```sh
yarn add @wix/sdk
```

Next, add the Wix SDK [Hono Middleware](https://hono.dev/docs/guides/middleware) in your [src/index.ts](src/index.ts) file:
```ts
import { Hono } from 'hono'
import { wixSdk } from 'hono-wix'; // Add this

const app = new Hono();

app.use(wixSdk()) // And this

// ...
```

Now, you can use any of the SDK modules anywhere in your code! For example, to use Wix Data, install the `@wix/data` package and use it as follows:
```ts
import { items } from '@wix/data';

// ...

app.get('/todos', async (c) => {
  const todos = await items.queryDataItems({ dataCollectionId: '<COLLECTION ID HERE>' }).find();
  return c.json({ todos });
});

// ...
```
