'use strict'

const Controller = require('revane').Controller

class TestController2 {
  plugin (fastify, opts, next) {
    fastify.get('/', (request, reply) => {
      reply.code(200)
      reply.send('test')
    })
    next()
  }
}

module.exports = Controller()(TestController2)
