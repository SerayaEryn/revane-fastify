import { Options } from './Options'
import fastify, { FastifyPluginCallback, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { IncomingMessage, ServerResponse, Server } from 'http'
import { isDecoratorDriven, buildPlugin, buildGlobalErrorHandler } from './DecoratorDriven'
import { RevaneResponse } from './RevaneResponse'
import fastifyPlugin from 'fastify-plugin'
import fastifyCookie from '@fastify/cookie'
import { RevaneRequest } from './RevaneRequest'
import { RevaneFastifyContext } from './RevaneFastifyContext'

interface Controller {
  plugin: FastifyPluginCallback
  options?: any
}

export * from './Decorators'
export {
  RevaneResponse,
  RevaneRequest,
  RevaneFastifyContext
}

export function revaneFastify (options: Options, context: RevaneFastifyContext): RevaneFastify {
  const instance = new RevaneFastify(options, context)
  return instance.initialize()
}

export class RevaneFastify {
  private promise: Promise<any> = Promise.resolve()
  private readonly server: FastifyInstance
  private readonly startTime: number = Date.now()

  constructor (
    private readonly options: Options,
    private readonly context: RevaneFastifyContext
  ) {
    this.server = fastify()
  }

  public initialize (): RevaneFastify {
    return this.register(fastifyCookie, {})
  }

  public register (plugin: string | FastifyPluginCallback, options: any): RevaneFastify {
    this.promise = this.registerAsync(plugin, options)
    return this
  }

  private async registerAsync (plugin: string | FastifyPluginCallback, options: any): Promise<void> {
    await this.promise
    if (typeof plugin === 'string') {
      const pluginById = await this.context.getById(plugin)
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

  private async registerControllersAsync (): Promise<void> {
    await this.promise
    const controllers = await this.context.getByComponentType('controller')
    for (const controller of controllers) {
      if (isDecoratorDriven(controller)) {
        this.server.register(buildPlugin(controller))
      } else {
        this.registerPlugin(controller)
      }
    }
  }

  public registerGlobalErrorHandler (): RevaneFastify {
    this.promise = this.registerGlobalErrorHandlerAsync()
    return this
  }

  private async registerGlobalErrorHandlerAsync (): Promise<void> {
    await this.promise
    const controllerAdvices = await this.context.getByComponentType('controlleradvice')
    const errorHandler = buildGlobalErrorHandler(controllerAdvices)
    if (errorHandler != null) {
      this.server.setErrorHandler(errorHandler as any)
    }
  }

  public async listen (addressProviderId: string): Promise<string> {
    await this.promise
    const options = await this.getHostAndPort(addressProviderId)

    const address = await this.server.listen({
      port: options.port, 
      host: options.host
    })
    await this.logStartUp()
    return address
  }

  public async close (): Promise<void> {
    // tslint disable-next-line
    return await this.server.close()
  }

  public port (): number {
    const addressInfo: any = this.server.server.address()
    return addressInfo.port
  }

  public ready (callback: (err?: Error, fastify?: FastifyInstance<Server, IncomingMessage, ServerResponse>) => void): RevaneFastify {
    this.promise = this.promise
      .then(async () => {
        return await new Promise((resolve, reject) => {
          this.server.ready()
            .then(
              () => {
                if (callback) {
                  callback(null, this.server)
                }
                resolve(null)
              },
              (err) => {
                if (callback) {
                  callback(err, this.server)
                }
                reject(err)
              })
        })
      })
    return this
  }

  public setErrorHandler (handler: string | ((error: Error, request: FastifyRequest, reply: FastifyReply) => void)): RevaneFastify {
    this.promise = this.setErrorHandlerAsync(handler)
    return this
  }

  private async setErrorHandlerAsync (handler: string | ((error: Error, request: FastifyRequest, reply: FastifyReply) => void)): Promise<void> {
    await this.promise
    if (typeof handler === 'string') {
      const errorHandler = await this.context.getById(handler)
      this.server.setErrorHandler(errorHandler.errorHandler)
    } else {
      this.server.setErrorHandler(handler)
    }
  }

  public setNotFoundHandler (handler: string | ((request: FastifyRequest, reply: FastifyReply) => void)): RevaneFastify {
    this.promise = this.setNotFoundHandlerAsync(handler)
    return this
  }

  private async setNotFoundHandlerAsync (handler: string | ((request: FastifyRequest, reply: FastifyReply) => void)): Promise<void> {
    await this.promise
    if (typeof handler === 'string') {
      const notFoundHandler = await this.context.getById(handler)
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

  private async getHostAndPort (addressProviderId?: string): Promise<{host: string, port: number}> {
    let host: string
    let port: number
    if (typeof addressProviderId === 'string') {
      const addressProvider = await this.context.getById(addressProviderId)
      if (await addressProvider.has(this.options.hostKey || 'revane.server.host')) {
        host = addressProvider.get(this.options.hostKey || 'revane.server.host')
      } else {
        host = 'localhost'
      }
      if (await addressProvider.has(this.options.portKey || 'revane.server.port')) {
        port = addressProvider.get(this.options.portKey || 'revane.server.port')
      } else {
        port = 3000
      }
    } else {
      host = this.options.host
      port = this.options.port
    }
    return { host, port }
  }

  private async logStartUp (): Promise<void> {
    if (!this.options.silent && await this.context.hasById('logger')) {
      const logger = await this.context.getById('logger')
      logger.info(`Fastify started on port: ${this.port()}`)
      const startUpTime = Date.now() - this.startTime
      logger.info(`Startup in ${startUpTime} ms`)
    }
  }
}

function isBindable (func): boolean {
  return func.name && !func.name.startsWith('bound')
}

function isPlugin (func): boolean {
  return func[Symbol.for('skip-override')] === true
}

export {
  FastifyInstance
} from 'fastify'
