# hono-wix-app

Congratulations on creating your Hono ❤️ Wix app!

You now have a [Hono.dev](https://hono.dev) application that is connected to your Wix site. This means that you get the best
of both worlds:
1. You can work on your completely standard Hono application, including: running it locally, testing it, and using any Hono integrations you like
2. You are connected to a Wix site, which gives you our Headless solution (serverless runtime), database and object storage, and our various business solutions, like our ecom platform, blogging platform, bookings, and more.

## Get started with your app
Start with [src/index.ts](src/index.ts), where you can find your Hono app.

Write your first test at [tests/app.spec.ts](tests/app.spec.ts).

Finally, you can run the following npm scripts:
- `dev` - start your dev server locally
- `test` - test your server
- `build` - build your project
- `publish` - deploy your server to your Wix site
- `manage` - manage your Wix site on wix.com

## Learn about Wix Headless
The Wix Headless platform lets you enjoy all the benefits of a Wix site in the form of a BaaS (backend as a service). This includes:
- Your own database using [Wix Data](https://dev.wix.com/docs/sdk/backend-modules/data/introduction)
- Complete storefront & ecommerce solution using [Wix Stores](https://dev.wix.com/docs/sdk/backend-modules/ecom/introduction)
- User auth, login & membership management using [Wix Members](https://dev.wix.com/docs/sdk/backend-modules/members/members/introduction)
- Files and media storage using [Wix Media](https://dev.wix.com/docs/sdk/backend-modules/media/introduction)
- Booking, scheduling & calendar services using [Wix Bookings](https://dev.wix.com/docs/sdk/backend-modules/bookings/introduction)
- Blog, articles & newsfeed solution using [Wix Blogs](https://dev.wix.com/docs/sdk/backend-modules/blog/introduction)
- Countless other integrations for your project on the [Wix App Market](https://www.wix.com/app-market)

And more!

If you want to manage the integrations on your Wix site, simply run `npm run manage` or `yarn manage` to go to your site's dashboard.

You can learn about the Wix APIS & the Wix SDK on [dev.wix.com](https://dev.wix.com/docs/sdk).

### Using the Wix SDK
In order to use any of the above features, you need to use the [Wix SDK](https://dev.wix.com/docs/sdk).

Start by installing the SDK:
```sh
npm install @wix/sdk
```

or
```sh
yarn add @wix/sdk
```

Then, add the Wix SDK [Hono Middleware](https://hono.dev/docs/guides/middleware) in your [src/index.ts](src/index.ts) file:

```ts
import { Hono } from 'hono'
import { wixSdk } from 'hono-wix'; // add this

const app = new Hono();

app.use(wixSdk()) // and this

// ...
```

Now, you can use any of the SDK modules from anywhere in your code! For instance, in order to use Wix Data, install the `@wix/data` package, and use it in the following manner:

```ts
import { items } from '@wix/data';

// ...

app.get('/todos', async (c) => {
  const todos = await items.queryDataItems({ dataCollectionId: '<COLLECTION ID HERE>' }).find();
  return c.json({ todos });
});

// ...
```
