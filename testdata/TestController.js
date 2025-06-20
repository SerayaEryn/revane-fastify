import fastifyPlugin from 'fastify-plugin'

export default class TestController {
  constructor () {
    this.plugin = fastifyPlugin(this.plugin.bind(this))
  }

  plugin (fastify, opts, next) {
    fastify.get('/', (request, reply) => {
      reply.code(200)
      reply.send('test')
    })
    fastify.get('/big', (request, reply) => {
      reply.code(200)
      reply.header('content-type', 'text/plain')
      reply.send('x'.repeat(2*1024))
    })
    next()
  }
}
