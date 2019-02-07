'use strict'

const Fastify = require('fastify')
const fastifyPlugin = require('fastify-plugin')

const registerPlugin = Symbol('registerPlugin')
const getHostAndPort = Symbol('getHostAndPort')
const logStartUp = Symbol('logStartUp')

class RevaneFastify {
  constructor (options, beanProvider) {
    this.options = options
    this.server = Fastify()
    this.beanProvider = beanProvider
    this.promise = Promise.resolve()
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
        const pluginById = this.beanProvider.get(plugin)
        this[registerPlugin](pluginById)
      } else {
        this.server.register(plugin, options)
      }
    })
    return this
  }

  registerControllers () {
    this.promise = this.promise.then(() => {
      const controllers = this.beanProvider.getByType('controller')
      for (const controller of controllers) {
        this[registerPlugin](controller)
      }
    })
    return this
  }

  async listen (addressProviderId) {
    await this.promise
    const { host, port } = this[getHostAndPort](addressProviderId)

    return new Promise((resolve, reject) => {
      this.server.listen(port, host, (err, address) => {
        if (err) {
          reject(err)
        } else {
          this[logStartUp]()
          resolve(address)
        }
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
      .then(() => {
        if (typeof handler === 'string') {
          const errorHandler = this.beanProvider.get(handler)
          this.server.setErrorHandler(errorHandler.errorHandler)
        } else {
          this.server.setErrorHandler(handler)
        }
      })
    return this
  }

  setNotFoundHandler (handler) {
    this.promise = this.promise
      .then(() => {
        if (typeof handler === 'string') {
          const notFoundHandler = this.beanProvider.get(handler)
          this.server.setNotFoundHandler(notFoundHandler.notFoundHandler)
        } else {
          this.server.setNotFoundHandler(handler)
        }
      })
    return this
  }

  after (handler) {
    this.promise = this.promise
      .then(() => this.server.after(handler))
    return this
  }

  [registerPlugin] (plugin) {
    if (isBindable(plugin.plugin)) {
      plugin.plugin = plugin.plugin.bind(plugin)
    }
    if (!isPlugin(plugin.plugin)) {
      plugin.plugin = fastifyPlugin(plugin.plugin)
    }
    const opts = plugin.options || {}
    this.server.register(plugin.plugin, opts)
  }

  [getHostAndPort] (addressProviderId) {
    let host
    let port
    if (typeof addressProviderId === 'string') {
      const addressProvider = this.beanProvider.get(addressProviderId)
      host = addressProvider.get(this.options.hostKey || 'fastify.host')
      port = addressProvider.get(this.options.portKey || 'fastify.port')
    } else {
      host = this.options.host
      port = this.options.port
    }
    return { host, port }
  }

  [logStartUp] () {
    if (!this.options.silent && this.beanProvider.has('logger')) {
      const logger = this.beanProvider.get('logger')
      logger.info(`Fastify started on port: ${this.port()}`)
      const startUpTime = Date.now() - this.startTime
      logger.info(`Startup in ${startUpTime} ms`)
    }
  }
}

function isBindable (func) {
  return !func.name.startsWith('bound')
}

function isPlugin (func) {
  return func[Symbol.for('skip-override')] === true
}

module.exports = RevaneFastify
module.exports.default = RevaneFastify
