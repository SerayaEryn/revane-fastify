'use strict'

module.exports = class Config {
  has (key) {
    const map = {
      'fastify.host': 'localhost',
      'fastify.port': 0
    }
    return map[key] != null
  }

  get (key) {
    const map = {
      'fastify.host': 'localhost',
      'fastify.port': 0
    }
    return map[key]
  }
}
