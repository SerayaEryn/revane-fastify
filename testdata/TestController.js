'use strict'

const Controller = require('revane').Controller
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

module.exports = Controller()(TestController)
