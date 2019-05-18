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
const Revane = require('revane');

const revane = new Revane({
  basePackage: __dirname
});
const options = {
  port: 3000
};
const revaneFastify = new RevaneFastify(options, revane);
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
    .ready((err, instance) => {
      // ...
    })
    .listen()
    .then((address) => {
      // ...
    });
```

## API

### new RevaneFastify(options, revane)

#### options

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

## Controllers

It is possible to create controllers using decorators.

```js
import { Get, Param } from 'revane-fastify'

class UserController {
  @Get('/user/:id')
  getUser (@Param id) {
    return {
      id
    }
  }

  @Get('/users/')
  getUsers () {
    return []
  }
}
```

There are decorators for the http methods:

* Get(url, [options])
* Post(url, [options])
* Put(url, [options])
* Delete(url, [options])
* Patch(url, [options])
* Head(url, [options])
* Options(url, [options])
* All(url, [options])

Furthermore there are decorators that provide information from the `request` and the `reply` itself.

* Query
* Cookie
* Param
* Body
* Header
* Reply
