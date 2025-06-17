import request from 'request'
import test from 'ava'
import { revaneFastify } from '../src/RevaneFastify.js'
import { ErrorHandlerWithoutCode } from '../testdata/ErrorHandlerWithoutCode.js'
import { TestLogger } from '../testdata/TestLogger.js'


const beanProvider = {
  getById (key) {
    if (key === 'userController') {
      return new ErrorHandlerWithoutCode()
    }
    if (key === 'logger') {
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
          t.is(response.statusCode, 418)
          t.is(body.toString(), 'allerrors')
          instance.close()
          resolve()
        })
      })
      .catch(console.error)
  })
})
