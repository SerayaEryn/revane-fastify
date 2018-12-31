'use strict'

const fastifyPlugin = require('fastify-plugin')

module.exports = class TestController {
  constructor () {
    this.plugin = fastifyPlugin(this.plugin.bind(this))
  }

  plugin (fastify, opts, next) {
    fastify.get('/', (request, reply) => {
      reply.code(200)
      reply.send('test')
    })
    next()
  }
}
