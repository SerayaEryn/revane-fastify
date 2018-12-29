'use strict'

const Component = require('revane').Component
const fastifyPlugin = require('fastify-plugin')

class TestController {
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

module.exports = Component()(TestController)
