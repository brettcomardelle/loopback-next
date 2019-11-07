// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
