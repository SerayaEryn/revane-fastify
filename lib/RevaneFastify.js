'use strict'

const Fastify = require('fastify')
const Revane = require('revane')

module.exports = class RevaneFastify {
  constructor (options) {
    this.options = options
    this.server = Fastify()
    this.revane = new Revane(this.options.revane)
    this.promise = this.revane.initialize()
    this.startTime = Date.now()
  }

  use (middleware) {
    this.promise = this.promise.then(() => {
      this.server.use(middleware)
    })
    return this
  }

  register (plugin, options) {
    this.promise = this.promise.then(() => {
      if (typeof plugin === 'string') {
        const pluginById = this.revane.get(plugin)
        const opts = pluginById.options || {}
        this.server.register(pluginById.plugin, opts)
      } else {
        this.server.register(plugin, options)
      }
    })
    return this
  }

  listen () {
    return this.promise
      .then(() => {
        const { host, port } = this.options
        return new Promise((resolve, reject) => {
          this.server.listen(port, host, (err, address) => {
            if (err) {
              reject(err)
            } else {
              this._logStartUp()
              resolve(address)
            }
          })
        })
      })
  }

  close () {
    return new Promise((resolve) => {
      this.server.close(() => resolve())
    })
  }

  port () {
    return this.server.server.address().port
  }

  ready (callback) {
    this.promise = this.promise
      .then(() => {
        return new Promise((resolve, reject) => {
          this.server.ready((err) => {
            if (callback) {
              callback(err)
            }
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
      })
    return this
  }

  setErrorHandler (handler) {
    this.promise = this.promise
      .then(() => this.server.setErrorHandler(handler))
    return this
  }

  setNotFoundHandler (handler) {
    this.promise = this.promise
      .then(() => this.server.setNotFoundHandler(handler))
    return this
  }

  after (handler) {
    this.promise = this.promise
      .then(() => this.server.after(handler))
    return this
  }

  _logStartUp () {
    if (!this.options.silent && this.revane.has('logger')) {
      const logger = this.revane.get('logger')
      logger.info(`Fastify started on port: ${this.port()}`)
      const startUpTime = Date.now() - this.startTime
      logger.info(`Startup in ${startUpTime} ms`)
    }
  }
}
