'use strict'

const Service = require('revane').Service

class TestLogger {
  info (message) {
    console.log(message)
  }
}

Service('logger')(TestLogger)

module.exports = TestLogger
