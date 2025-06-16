'use strict'

const test = require('ava')
const revaneFastify = require('../bin/src/RevaneFastify').revaneFastify
const request = require('request')

const beanProvider = {
  getById (key) {
    if (key === 'userController') {
      return new (require('../bin/testdata/ErrorHandlerWithoutCode').UserController)()
    }
    if (key === 'logger') {
      return new (require('../testdata/TestLogger'))()
    }
  },
  hasById () {
    return true
  }
}

test('errorhandler with errorCode and statusCode', async (t) => {
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
          uri: `http://localhost:${port}/error1`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 418)
          t.is(body.toString(), 'allerrors')
          instance.close()
          resolve()
        })
      })
      .catch(console.error)
  })
})
