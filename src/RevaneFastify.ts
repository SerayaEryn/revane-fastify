'use strict'

import { Options } from './Options'
import { Plugin, FastifyRequest, FastifyReply, FastifyInstance, ServerOptions } from 'fastify'
import { IncomingMessage, ServerResponse, Server } from 'http'
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { isDecoratorDriven, buildPlugin } from './DecoratorDriven'
import { ApplicationContext } from 'revane-ioc'
import { RevaneResponse } from './RevaneResponse'

type HttpServer = (Server | Http2Server)
type HttpRequest = (IncomingMessage | Http2ServerRequest)
type HttpResponse = (ServerResponse | Http2ServerResponse)

const Fastify = require('fastify')
const fastifyPlugin = require('fastify-plugin')

type Controller = {
  plugin: Plugin<HttpServer, HttpRequest, HttpResponse, any>
  options?: any
}

export * from './Decorators'
export {
  RevaneResponse
}

export default class RevaneFastify {
  private options: Options
  private promise: Promise<any> = Promise.resolve()
  private server: FastifyInstance
  private context: ApplicationContext
  private startTime: number = Date.now()

  constructor (options: Options, context: ApplicationContext) {
    this.options = options

    this.server = Fastify()
    this.context = context
  }

  public use (middleware: (req: IncomingMessage, res: ServerResponse, next: Function) => void): RevaneFastify {
    this.promise = this.promise.then(() => {
      this.server.use(middleware)
    })
    return this
  }

  public register (plugin: string | (Plugin<HttpServer, HttpRequest, HttpResponse, any>), options: any): RevaneFastify {
    this.promise = this.registerAsync(plugin, options)
    return this
  }

  private async registerAsync (plugin: string | (Plugin<HttpServer, HttpRequest, HttpResponse, any>), options: any): Promise<void> {
    await this.promise
    if (typeof plugin === 'string') {
      const pluginById = await this.context.get(plugin)
      if (isDecoratorDriven(pluginById)) {
        this.server.register(buildPlugin(pluginById))
      } else {
        this.registerPlugin(pluginById)
      }
    } else {
      this.server.register(plugin, options)
    }
  }

  public registerControllers (): RevaneFastify {
    this.promise = this.registerControllersAsync()
    return this
  }

  private async registerControllersAsync () {
    await this.promise
    const controllers = await this.context.getByType('controller')
    for (const controller of controllers) {
      if (isDecoratorDriven(controller)) {
        this.server.register(buildPlugin(controller))
      } else {
        this.registerPlugin(controller)
      }
    }
  }

  public async listen (addressProviderId: string): Promise<string> {
    await this.promise
    const options = await this.getHostAndPort(addressProviderId)

    const address = await this.server.listen(options.port, options.host)
    await this.logStartUp()
    return address
  }

  public close (): Promise<void> {
    return this.server.close()
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
              resolve(null)
            }
          })
        })
      })
    return this
  }

  public setErrorHandler (handler: string | ((error: Error, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void)): RevaneFastify {
    this.promise = this.setErrorHandlerAsync(handler)
    return this
  }

  private async setErrorHandlerAsync (handler: string | ((error: Error, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void)) {
    await this.promise
    if (typeof handler === 'string') {
      const errorHandler = await this.context.get(handler)
      this.server.setErrorHandler(errorHandler.errorHandler)
    } else {
      this.server.setErrorHandler(handler)
    }
  }

  public setNotFoundHandler (handler: string | ((request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void)): RevaneFastify {
    this.promise = this.setNotFoundHandlerAsync(handler)
    return this
  }

  private async setNotFoundHandlerAsync (handler: string | ((request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void)) {
    await this.promise
    if (typeof handler === 'string') {
      const notFoundHandler = await this.context.get(handler)
      this.server.setNotFoundHandler(notFoundHandler.notFoundHandler)
    } else {
      this.server.setNotFoundHandler(handler)
    }
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

  private async getHostAndPort (addressProviderId?: string) {
    let host: string
    let port: number
    if (typeof addressProviderId === 'string') {
      const addressProvider = await this.context.get(addressProviderId)
      host = addressProvider.get(this.options.hostKey || 'revane.server.host')
      port = addressProvider.get(this.options.portKey || 'revane.server.port')
    } else {
      host = this.options.host
      port = this.options.port
    }
    return { host, port }
  }

  private async logStartUp (): Promise<void> {
    if (!this.options.silent && await this.context.has('logger')) {
      const logger = await this.context.get('logger')
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
