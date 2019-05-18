'use strict'

const test = require('ava')
const RevaneFastify = require('..')
const request = require('request')
const fastifyCookie = require('fastify-cookie')

const beanProvider = {
  get (key) {
    if (key === 'userController') {
      return new (require('../bin/testdata/UserController').UserController)()
    }
    if (key === 'logger') {
      return new (require('../testdata/TestLogger'))()
    }
  },
  has () {
    return true
  }
}

test.cb('get', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/user`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'hello world')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('should be able call @All handler with GET', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/something`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'hello world')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('should be able call @All handler with POST', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'POST',
        uri: `http://localhost:${port}/something`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'hello world')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('should pass cookie value to handler', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register(fastifyCookie)
    .register('userController')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/cookie`,
        headers: {
          cookie: 'test=hello world; Path=/; HttpOnly',
        }
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'hello world')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('get - alternate name', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/header`,
        headers: {
          'x-test': 'test'
        }
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'test')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('multiple parameters', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/users/de?ids=1,2`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), 'de1,2')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('get with param', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/user/42`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 200)
        t.is(body.toString(), '42')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('get with reply and status', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .ready(() => {
      t.truthy(revaneFastify.server.printRoutes())
    })
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/error`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 500)
        t.is(body.toString(), 'booom')
        revaneFastify.close()
        t.end()
      })
    })
})

test.cb('redirect', (t) => {
  t.plan(4)

  const options = {
    port: 0
  }
  const revaneFastify = new RevaneFastify(options, beanProvider)
  revaneFastify
    .register('userController')
    .ready(() => {
      t.truthy(revaneFastify.server.printRoutes())
    })
    .listen()
    .then(() => {
      revaneFastify.server.server.unref()
      const port = revaneFastify.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/gone`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 500)
        t.is(body.toString(), 'booom')
        revaneFastify.close()
        t.end()
      })
    })
})
