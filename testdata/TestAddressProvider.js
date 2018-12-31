'use strict'

module.exports = class Config {
  get (key) {
    const map = {
      'fastify.host': 'localhost',
      'fastify.port': 0
    }
    return map[key]
  }
}
