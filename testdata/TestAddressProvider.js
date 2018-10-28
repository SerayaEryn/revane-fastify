const Component = require('revane').Component

class Config {
  get (key) {
    const map = {
      'fastify.host': 'localhost',
      'fastify.port': 0
    }
    return map[key]
  }
}

module.exports = Component()(Config)
