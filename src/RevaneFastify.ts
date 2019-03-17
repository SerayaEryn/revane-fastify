'use strict'

import { Options } from './Options'
import { Plugin, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { IncomingMessage, ServerResponse, Server } from 'http'
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { BeanProvider } from './BeanProvider'

type HttpServer = (Server | Http2Server)
type HttpRequest = (IncomingMessage | Http2ServerRequest)
type HttpResponse = (ServerResponse | Http2ServerResponse)

const Fastify = require('fastify')
const fastifyPlugin = require('fastify-plugin')

type Controller = {
  plugin: Plugin<HttpServer, HttpRequest, HttpResponse, any>
  options?: any
}

export * from './BeanProvider'

export default class RevaneFastify {
  private options: Options
  private promise: Promise<any> = Promise.resolve()
  private server: FastifyInstance
  private beanProvider: BeanProvider
  private startTime: number = Date.now()

  constructor (options: Options, beanProvider: BeanProvider) {
    this.options = options
    this.server = Fastify()
    this.beanProvider = beanProvider
  }

  public use (middleware: (req: IncomingMessage, res: ServerResponse, next: Function) => void): RevaneFastify {
    this.promise = this.promise.then(() => {
      this.server.use(middleware)
    })
    return this
  }

  public register (plugin: string | (Plugin<HttpServer, HttpRequest, HttpResponse, any>), options: any): RevaneFastify {
    this.promise = this.promise.then(() => {
      if (typeof plugin === 'string') {
        const pluginById = this.beanProvider.get(plugin)
        this.registerPlugin(pluginById)
      } else {
        this.server.register(plugin, options)
      }
    })
    return this
  }

  public registerControllers (): RevaneFastify {
    this.promise = this.promise.then(() => {
      const controllers = this.beanProvider.getByType('controller')
      for (const controller of controllers) {
        this.registerPlugin(controller)
      }
    })
    return this
  }

  public async listen (addressProviderId: string): Promise<string> {
    await this.promise
    const { host, port } = this.getHostAndPort(addressProviderId)

    return new Promise((resolve, reject) => {
      this.server.listen(port, host, (err, address) => {
        if (err) {
          reject(err)
        } else {
          this.logStartUp()
          resolve(address)
        }
      })
    })
  }

  public close (): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve())
    })
  }

  public port (): number {
    const addressInfo: any = this.server.server.address()
    return addressInfo.port
  }

  public ready (callback: (err?: Error, fastify?: FastifyInstance<Server, IncomingMessage, ServerResponse>) => void): RevaneFastify {
    this.promise = this.promise
      .then(() => {
        return new Promise((resolve, reject) => {
          this.server.ready((err) => {
            if (callback) {
              callback(err, this.server)
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

  public setErrorHandler (handler: string | ((error: Error, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void)): RevaneFastify {
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

  public setNotFoundHandler (handler: string | ((request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void)): RevaneFastify {
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

  public after (handler: (err: Error) => void): RevaneFastify {
    this.promise = this.promise
      .then(() => this.server.after(handler))
    return this
  }

  private registerPlugin (plugin: Controller): void {
    if (isBindable(plugin.plugin)) {
      plugin.plugin = plugin.plugin.bind(plugin)
    }
    if (!isPlugin(plugin.plugin)) {
      plugin.plugin = fastifyPlugin(plugin.plugin)
    }
    const opts = plugin.options || {}
    this.server.register(plugin.plugin, opts)
  }

  private getHostAndPort (addressProviderId?: string) {
    let host: string
    let port: number
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

  private logStartUp (): void {
    if (!this.options.silent && this.beanProvider.has('logger')) {
      const logger = this.beanProvider.get('logger')
      logger.info(`Fastify started on port: ${this.port()}`)
      const startUpTime = Date.now() - this.startTime
      logger.info(`Startup in ${startUpTime} ms`)
    }
  }
}

function isBindable (func) {
  return func.name && !func.name.startsWith('bound')
}

function isPlugin (func) {
  return func[Symbol.for('skip-override')] === true
}

export {
  FastifyInstance
} from 'fastify'

module.exports = RevaneFastify
module.exports.default = RevaneFastify
