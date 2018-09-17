const Component = require('revane').Component

class Handler {
  constructor () {
    this.errorHandler = this.errorHandler.bind(this)
    this.notFoundHandler = this.notFoundHandler.bind(this)
  }

  errorHandler (ignore, request, reply) {
    reply.code(500)
      .send('test')
  }

  notFoundHandler (request, reply) {
    reply.code(404)
    reply.send('test')
  }
}

module.exports = Component()(Handler)
