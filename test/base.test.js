const fastifyPlugin = require('fastify-plugin')
const path = require('path')
const request = require('request')
const test = require('tap').test
const RevaneFastify = require('..')

test('Should register controller', (t) => {
  t.plan(2)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
  revaneFastify
    .register('testController')
    .ready(() => {
      t.ok(revaneFastify.server.printRoutes(), '')
    })
    .listen()
    .then(() => {
      t.ok(revaneFastify.port())
      revaneFastify.close()
    })
})

test('Should register plugin', (t) => {
  t.plan(1)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
  revaneFastify
    .register(fastifyPlugin(plugin))
    .ready()
    .listen()
    .then(() => {
      t.ok(revaneFastify.port())
      revaneFastify.close()
    })
})

test('Should call after', (t) => {
  t.plan(2)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
  revaneFastify
    .register(fastifyPlugin(plugin))
    .after((err) => t.error(err))
    .ready()
    .listen()
    .then(() => {
      t.ok(revaneFastify.port())
      revaneFastify.close()
    })
})

test('Should use middleware', (t) => {
  t.plan(1)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
  revaneFastify
    .use((req, res, next) => next())
    .ready()
    .listen()
    .then(() => {
      t.ok(revaneFastify.port())
      revaneFastify.close()
    })
})

test('Should set not found handler', (t) => {
  t.plan(4)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
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
        t.error(err)
        t.strictEqual(response.statusCode, 404)
        t.strictEqual(body.toString(), 'test')
        revaneFastify.close()
      })
    })
})

test('Should set error handler', (t) => {
  t.plan(4)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
  revaneFastify
    .register(fastifyPlugin((instance, opts, next) => {
      instance.get('/', function (request, reply) {
        reply.send(new Error())
      })
      next()
    }))
    .setErrorHandler(function (error, request, reply) {
      t.ok(error)
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
        t.error(err)
        t.strictEqual(response.statusCode, 500)
        t.strictEqual(body.toString(), 'test')
        revaneFastify.close()
      })
    })
})

test('Should start server', (t) => {
  t.plan(3)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
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
        t.error(err)
        t.strictEqual(response.statusCode, 200)
        t.strictEqual(body.toString(), 'test')
        revaneFastify.close()
      })
    })
})

test('Should handle error in plugin in listen', (t) => {
  t.plan(1)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
  revaneFastify
    .register(errorPlugin)
    .listen()
    .catch((err) => {
      t.ok(err)
    })
})

test('Should handle error in plugin in ready', (t) => {
  t.plan(2)

  const options = {
    revane: {
      basePackage: path.join(__dirname, '../testdata')
    },
    port: 0
  }
  const revaneFastify = new RevaneFastify(options)
  revaneFastify
    .register(errorPlugin)
    .ready((err) => t.ok(err))
    .listen()
    .catch((err) => {
      t.ok(err)
    })
})

function errorPlugin (fastify, opts, next) {
  next(new Error())
}

function plugin (fastify, opts, next) {
  fastify.decorateReply('test', 'test')
  next()
}
