'use strict'

const test = require('ava')
const revaneFastify = require('../bin/src/RevaneFastify').revaneFastify
const request = require('request')

const beanProvider = {
  get (key) {
    if (key === 'userController') {
      return new (require('../bin/testdata/ErrorHandlerController').UserController)()
    }
    if (key === 'logger') {
      return new (require('../testdata/TestLogger'))()
    }
  },
  has () {
    return true
  }
}

test.cb('errorhandler with errorCode and statusCode', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, beanProvider)
  instance
    .register('userController')
    .listen()
    .then(() => {
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/error1`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 505)
        t.is(body.toString(), 'err1')
        instance.close()
        t.end()
      })
    })
    .catch(console.error)
})

test.cb('errorhandler without errorCode and statusCode', (t) => {
  t.plan(3)

  const options = {
    port: 0
  }
  const instance = revaneFastify(options, beanProvider)
  instance
    .register('userController')
    .listen()
    .then(() => {
      instance.server.server.unref()
      const port = instance.port()
      request({
        method: 'GET',
        uri: `http://localhost:${port}/error2`
      }, (err, response, body) => {
        t.falsy(err)
        t.is(response.statusCode, 500)
        t.is(body.toString(), 'allerrors')
        instance.close()
        t.end()
      })
    })
    .catch(console.error)
})
