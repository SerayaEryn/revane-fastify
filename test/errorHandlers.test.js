import request from 'request'
import test from 'ava'
import { revaneFastify } from '../src/RevaneFastify.js'
import { ErrorHandlerController } from '../testdata/ErrorHandlerController.js'
import { TestLogger } from '../testdata/TestLogger.js'


const beanProvider = {
  getById (key) {
    if (key === 'userController') {
      return new ErrorHandlerController()
    }
    if (key === 'rootLogger') {
      return new TestLogger()
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
          t.is(response.statusCode, 505)
          t.is(body.toString(), 'err1')
          instance.close()
          resolve()
        })
      })
      .catch(console.error)
  })
})

test('errorhandler without errorCode and statusCode', async (t) => {
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
          uri: `http://localhost:${port}/error2`
        }, (err, response, body) => {
          t.falsy(err)
          t.is(response.statusCode, 500)
          t.is(body.toString(), 'allerrors')
          instance.close()
          resolve()
        })
      })
      .catch(console.error)
  })
})
