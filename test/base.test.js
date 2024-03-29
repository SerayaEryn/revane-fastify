'use strict'

const fastifyPlugin = require('fastify-plugin')
const request = require('request')
const test = require('ava')
const revaneFastify = require('..').revaneFastify

const revane = {
  getById (key) {
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
  hasById () {
    return true
  },
  getByComponentType () {
    return [new (require('../testdata/TestController2'))()]
  }
}

test('Should register controller', (t) => {
  t.plan(2)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  return instance
    .register('testController')
    .ready((ignore, instance) => {
      t.truthy(instance)
    })
    .listen()
    .then(() => {
      t.truthy(instance.port())
      instance.close()
    })
    .catch(console.error)
})

test.cb('Should bind and create plugin', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  instance
    .register('testController2')
    .listen()
    .then(() => {
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        instance.close()
        t.end()
      })
    })
})

test('Should register plugin', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  return instance
    .register(fastifyPlugin(plugin))
    .ready()
    .listen()
    .then(() => {
      t.truthy(instance.port())
      instance.close()
    })
})

test('Should call after', (t) => {
  t.plan(2)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  return instance
    .register(fastifyPlugin(plugin))
    .after((err) => t.falsy(err))
    .ready()
    .listen()
    .then(() => {
      t.truthy(instance.port())
      instance.close()
    })
})

test.cb('Should set not found handler', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  instance
    .setNotFoundHandler(function (request, reply) {
      reply.code(404)
      reply.send('test')
    })
    .ready()
    .listen()
    .then(() => {
      t.pass()
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/test`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 404)
        t.is(body.toString(), 'test')
        instance.close()
        t.end()
      })
    })
})

test.cb('Should set not found handler by id', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  instance
    .setNotFoundHandler('handler')
    .ready()
    .listen()
    .then(() => {
      t.pass()
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/test`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 404)
        t.is(body.toString(), 'test')
        instance.close()
        t.end()
      })
    })
})

test.cb('Should set error handler by id', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  instance
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
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 500)
        t.is(body.toString(), 'test')
        instance.close()
        t.end()
      })
    })
})

test.cb('Should set error handler', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  instance
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
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 500)
        t.is(body.toString(), 'test')
        instance.close()
        t.end()
      })
    })
})

test.cb('Should start server', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  instance
    .register('testController')
    .register(fastifyPlugin(plugin))
    .listen()
    .then((address) => {
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        instance.close()
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
  const instance = revaneFastify(options, revane)
  instance
    .register('testController')
    .register(fastifyPlugin(plugin))
    .listen('config')
    .then((address) => {
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        instance.close()
        t.end()
      })
    })
})

test.cb('Should start server using addressProvider and registerControllers', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  instance
    .registerControllers()
    .register(fastifyPlugin(plugin))
    .listen('config')
    .then((address) => {
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        instance.close()
        t.end()
      })
    })
})

test('listen should call callback with string', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  return instance
    .registerControllers()
    .register(fastifyPlugin(plugin))
    .listen('config')
    .then((address) => {
      t.true(typeof address === 'string')
      instance.close()
    })
})

test('should register plugin without name', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, revane)
  return instance
    .registerControllers()
    .register(fastifyPlugin((instance, options, next) => next()))
    .listen('config')
    .then((address) => {
      t.true(typeof address === 'string')
      instance.close()
    })
})

test('Should handle error in plugin in listen', (t) => {
  t.plan(1)

  const options = {
    port: 0
  }
  return revaneFastify(options, revane)
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
  return revaneFastify(options, revane)
    .register(errorPlugin)
    .ready((err) => t.truthy(err))
    .listen()
    .catch((err) => {
      t.truthy(err)
    })
})

function errorPlugin (fastify, opts, next) {
  next(new Error('booom'))
}

function plugin (fastify, opts, next) {
  fastify.decorateReply('test', 'test')
  next()
}
