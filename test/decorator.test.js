'use strict'

const test = require('ava')
const revaneFastify = require('..').revaneFastify
const request = require('request')

const beanProvider = {
  getById (key) {
    if (key === 'userController') {
      return new (require('../bin/testdata/UserController').UserController)()
    }
    if (key === 'userController2') {
      return new (require('../bin/testdata/UserController2').UserController2)()
    }
    if (key === 'logger') {
      return new (require('../testdata/TestLogger'))()
    }
  },
  hasById () {
    return true
  }
}

test('get', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/user`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'hello world')
          instance.close()
          resolve()
        })
      })
  })
})

test('should be able call @All handler with GET', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/something`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'hello world')
          instance.close()
          resolve()
        })
      })
  })
})

test('should be able call @All handler with POST', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'POST',
          uri: `http://localhost:${port}/something`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'hello world')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass cookie value to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/cookie`,
          headers: {
            cookie: 'test=hello world; Path=/; HttpOnly'
          }
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'hello world')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass request to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/uri`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.true(body.toString().startsWith('/uriGEThttplocalhost'))
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass cookie values to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/cookies`,
          headers: {
            cookie: 'test=hello world; Path=/; HttpOnly'
          }
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'true')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass header value to handler with alternate name', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
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
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass header values to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/headers`,
          headers: {
            'x-test': 'test'
          }
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'true')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass multiple parameters to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/users/de?ids=1,2`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'de1,2')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass param value to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/user/42`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), '42')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass param values to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/user2/42`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'true')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass logger to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/log`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'true')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass query parameters to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/queryParameters`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'true')
          instance.close()
          resolve()
        })
      })
  })
})

test('should pass request body to handler', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(3)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'POST',
          uri: `http://localhost:${port}/requestpost`,
          body: {
            test: 'hello world'
          },
          json: true
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 200)
          t.is(body.toString(), 'true')
          instance.close()
          resolve()
        })
      })
  })
})

test('get with reply and status', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(4)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .ready(() => {
        t.truthy(instance.printRoutes())
      })
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/error`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 500)
          t.is(body.toString(), 'booom')
          instance.close()
          resolve()
        })
      })
  })
})

test('redirect', async (t) => {
  return new Promise((resolve, reject) => {
    t.plan(4)

    const options = {
      port: 0
    }
    const instance = revaneFastify(options, beanProvider)
    instance
      .register('userController')
      .ready(() => {
        t.truthy(instance.printRoutes())
      })
      .listen()
      .then(() => {
        instance.unref()
        const port = instance.port()
        request({
          method: 'GET',
          uri: `http://localhost:${port}/gone`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 500)
          t.is(body.toString(), 'booom')
          instance.close()
          resolve()
        })
      })
  })
})
