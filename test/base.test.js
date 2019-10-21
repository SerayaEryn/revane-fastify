'use strict'

const fastifyPlugin = require('fastify-plugin')
const request = require('request')
const test = require('ava')
const RevaneFastify = require('..').default

const revane = {
  get (key) {
    if (key === 'testController') {
      return new (require('../testdata/TestController'))()
    }
    if (key === 'testController2') {
      return new (require('../testdata/TestController2'))()
    }
    if (key === 'config') {
      return new (require('../testdata/TestAddressProvider'))()
    }
    if (key === 'handler') {
      return new (require('../testdata/TestHandler'))()
    }
    if (key === 'logger') {
      return new (require('../testdata/TestLogger'))()
    }
  },
  has () {
    return true
  },
  getByType () {
    return [new (require('../testdata/TestController2'))()]
  }
}

test('Should register controller', (t) => {
  t.plan(2)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .register('testController')
    .ready((err, instance) => {
      t.truthy(instance)
    })
    .listen()
    .then(() => {
      t.truthy(revaneFastify.port())
      revaneFastify.close()
    })
})

test.cb('Should bind and create plugin', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .register('testController2')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test('Should register plugin', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .register(fastifyPlugin(plugin))
    .ready()
    .listen()
    .then(() => {
      t.truthy(revaneFastify.port())
      revaneFastify.close()
    })
})

test('Should call after', (t) => {
  t.plan(2)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .register(fastifyPlugin(plugin))
    .after((err) => t.falsy(err))
    .ready()
    .listen()
    .then(() => {
      t.truthy(revaneFastify.port())
      revaneFastify.close()
    })
})

test('Should use middleware', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .use((req, res, next) => next())
    .ready()
    .listen()
    .then(() => {
      t.truthy(revaneFastify.port())
      revaneFastify.close()
    })
})

test.cb('Should set not found handler', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .setNotFoundHandler(function (request, reply) {
      reply.code(404)
      reply.send('test')
    })
    .ready()
    .listen()
    .then(() => {
      t.pass()
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/test`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 404)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('Should set not found handler by id', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .setNotFoundHandler('handler')
    .ready()
    .listen()
    .then(() => {
      t.pass()
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/test`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 404)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('Should set error handler by id', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .register(fastifyPlugin((instance, opts, next) => {
      instance.get('/', function (request, reply) {
        reply.send(new Error())
      })
      next()
    }))
    .setErrorHandler('handler')
    .ready()
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 500)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('Should set error handler', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .register(fastifyPlugin((instance, opts, next) => {
      instance.get('/', function (request, reply) {
        reply.send(new Error())
      })
      next()
    }))
    .setErrorHandler(function (error, request, reply) {
      t.truthy(error)
      reply.code(500)
        .send('test')
    })
    .ready()
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 500)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('Should start server', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .register('testController')
    .register(fastifyPlugin(plugin))
    .listen()
    .then((address) => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('Should start server using addressProvider', (t) => {
  t.plan(3)

  const options = {
    port: 0,
    silent: true
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .register('testController')
    .register(fastifyPlugin(plugin))
    .listen('config')
    .then((address) => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('Should start server using addressProvider and registerControllers', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  revaneFastify
    .registerControllers()
    .register(fastifyPlugin(plugin))
    .listen('config')
    .then((address) => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test('listen should call callback with string', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .registerControllers()
    .register(fastifyPlugin(plugin))
    .listen('config')
    .then((address) => {
      t.true(typeof address === 'string')
      revaneFastify.close()
    })
})

test('should register plugin without name', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .registerControllers()
    .register(fastifyPlugin((instance, options, next) => next()))
    .listen('config')
    .then((address) => {
      t.true(typeof address === 'string')
      revaneFastify.close()
    })
})

test('Should handle error in plugin in listen', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .register(errorPlugin)
    .listen()
    .catch((err) => {
      t.truthy(err)
    })
})

test('Should handle error in plugin in ready', (t) => {
  t.plan(2)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, revane)
  return revaneFastify
    .register(errorPlugin)
    .ready((err) => t.truthy(err))
    .listen()
    .catch((err) => {
      t.truthy(err)
    })
})

function errorPlugin (fastify, opts, next) {
  next(new Error())
}

function plugin (fastify, opts, next) {
  fastify.decorateReply('test', 'test')
  next()
}
