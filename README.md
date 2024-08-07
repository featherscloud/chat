# Local-first chat

A local-first chat application built with different frameworks. It

- Has secure user logins
- Works offline
- Loads faster than server side rendering
- Can be deployed like any static website
- Does not need a server

## Getting started

To get user logins, sign up for [Feathers Cloud Auth](https://feathers.cloud/auth/) at [app.feathers.cloud](https://app.feathers.cloud) and create a new organization and application. Make sure to copy the application id (`did:key:`) and customize the theme 🤩

Then run the following in a terminal:

```sh
git clone git@github.com:featherscloud/chat.git
cd chat
npm install
npm run init
```

When prompted, paste your application id and choose your framework. Make sure to visit the development server (default [localhost:3000](http://localhost:3000)) that will be started to finalize initialization.

## Developing

Once initialized, the development server for any framework can be started like this:

```sh
npm run dev:<framework>

npm run dev:react
npm run dev:svelte
```

## Build and deploy

The chat application can be deployed like any static website. The build can be run with

```sh
npm run build:<framework>

npm run build:react
npm run build:svelte
```

Note that in a CI environment, the `VITE_CLOUD_APP_ID` and `VITE_AUTOMERGE_URL` from the `.env` files need to be set.

Then the `<framework>-chat/dist/` folder can be deployed like any static website.
