---
lang: en
title: 'Migrating Express middleware'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-express-middleware.html
---

Migrating app-level Express middleware from LoopBack 3 (LB3) to LoopBack 4 (LB4)
requires a wrapper Express app, which will the mount the LB4 and also act as the
point for mounting the shared Express middleware.

First, make sure you have done the necessary steps to mount your LB3 app on a
LB4 app as described in
[this tutorial](https://github.com/strongloop/loopback-next/tree/master/examples/lb3-application#tutorial).

Then, create a directory which will be the wrapper Express app. Move the LB4 app
into this directory, and move the `package.json` file from the LB4 app to this
directory.

Update the `build` script to `"cd lb4-app && npx lb-tsc"`, this will enable us
to build the LB4 app from the root of the wrapper directory.

Install the dependencies in the wrapper directory by running `npm i`.

Next, we have to create an `index.js` file in the wrapper directory, which will
mount the LB4 app.

{% include code-caption.html content="index.js" %}

```js
const express = require('express');
const http = require('http');
const path = require('path');
const pEvent = require('p-event');

const Lb4AppApplication = require('./lb4-app/dist/application')
  .Lb4AppApplication;

const app = express();
const config = {
  rest: {
    port: +process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    openApiSpec: {
      // useful when used with OpenAPI-to-GraphQL to locate your application
      setServersFromRequest: true,
    },
    // Use the LB4 application as a route. It should not be listening.
    listenOnStart: false,
  },
};
const lbApp = new Lb4AppApplication(config);

app.use('/api', lbApp.requestHandler);

// Express middleware shared by LB4 and LB3 apps
app.get('/hello', function(req, res) {
  res.send('Hello world!');
});

app.use(express.static(path.join(__dirname, '../public')));

async function start() {
  await lbApp.boot();
  await lbApp.start();
  const port = lbApp.restServer.config.port;
  const host = lbApp.restServer.config.host;
  const server = app.listen(port, host);
  await pEvent(server, 'listening');
  console.log(`Server is running at http://${host}:${port}`);
}

start();
```

This file acts as the entry point for starting the LB4 app and also provides the
familiar Express APIs via the `app` Express instance.

Make sure to run `npm run build` to compile the LB4 app written in TyepScript to
JavaScript any time you make changes to the app.

Start the app as usual using `npm start`.

A working example of migrating Express middleware from LB3 to LB4 app can be
found at
https://github.com/strongloop/loopback-next/tree/master/examples/migrate-express-middleware.
