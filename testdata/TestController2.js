'use strict'

module.exports = class TestController2 {
  plugin (fastify, opts, next) {
    fastify.get('/', (request, reply) => {
      reply.code(200)
      reply.send('test')
    })
    next()
  }
}
