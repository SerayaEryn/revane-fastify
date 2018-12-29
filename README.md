# revane-fastify

[![Build Status](https://travis-ci.org/SerayaEryn/revane-fastify.svg?branch=master)](https://travis-ci.org/SerayaEryn/revane-fastify)
[![Coverage Status](https://coveralls.io/repos/github/SerayaEryn/revane-fastify/badge.svg?branch=master)](https://coveralls.io/github/SerayaEryn/revane-fastify?branch=master) 
[![NPM version](https://img.shields.io/npm/v/revane-fastify.svg?style=flat)](https://www.npmjs.com/package/revane-fastify)

## Installation

```bash
npm install revane-fastify --save
```

## Example

```js
const RevaneFastify = require('revane-fastify');

const options = {
  revane: {
    basePackage: __dirname
  },
  port: 3000
};
const revaneFastify = new RevaneFastify(options);
return revaneFastify
    .setNotFoundHandler((err, request, reply) => {
      // ...
    })
    .setErrorHandler((request, reply) => {
      // ...
    })
    .register('something')
    .register((instance, opts, next) => {
      // ...
      next()
    })
    .after((err) => {
      // ...
    })
    .ready((err) => {
      // ...
    })
    .listen()
    .then((address) => {
      // ...
    });
```

## API

### new RevaneFastify(options)

#### options

##### revane
The options for [revane](https://github.com/SerayaEryn/revane).

##### host
The host that will passed to `fastify`.

##### port
The port that will passed to `fastify`.

##### silent

If set to `true` no information about the application will be logged. Defaults to `false`.

#### use(middleware)

Allows to add a middleware.<br>
**Note**: This will be executed asynchronous.

#### register(plugin, [options])
Allows to add a `fastify` plugin.<br>
**Note**: This will be executed asynchronous.
#### register(id)
Selects a bean by id and adds it to the `fastify` server.<br>
**Note**: This will be executed asynchronous.

#### registerControllers()

Registers all beans decorated with `@Controller()`.
**Note**: This will be executed asynchronous.

#### listen()

Starts listening on the configured host/port. Returns a Promise.

#### close()

Closes the server. Returns a Promise.

#### port()
Returns the port of the server.

#### ready(handler)
Calls the `handler` function when all olugins have been loaded.<br>
**Note**: This will be executed asynchronous.

#### setErrorHandler(handler)
Adds an error handler.
```js
fastifyRevane.setErrorHandler((error, request, reply) => {
  // ...
})
```
**Note**: This will be executed asynchronous.

#### setNotFoundHandler(handler)

Adds a page not found handler.
```js
fastifyRevane.setNotFoundHandler((error, request, reply) => {
  // ...
})
```
**Note**: This will be executed asynchronous.

#### after(handler)
Executes the `handler` function after the current plugin has been added.<br>
**Note**: This will be executed asynchronous.