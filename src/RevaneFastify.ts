import { Options } from './Options.js'
import fastify, { FastifyPluginCallback, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import { IncomingMessage, ServerResponse, Server } from 'node:http'
import { isDecoratorDriven, buildPlugin, buildGlobalErrorHandler } from './DecoratorDriven.js'
import { RevaneResponse } from './RevaneResponse.js'
import fastifyPlugin from 'fastify-plugin'
import fastifyCookie from '@fastify/cookie'
import { RevaneRequest } from './RevaneRequest.js'
import { RevaneFastifyContext } from './RevaneFastifyContext.js'
import { hostname } from 'node:os'

interface Controller {
  plugin: FastifyPluginCallback
  options?: any
}

const ACCESS_LOG_ENABLED = 'revane.access-logging.enabled'

export * from './Decorators.js'
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
  #options: Options
  #context: RevaneFastifyContext
  #promise: Promise<any>
  readonly #server: FastifyInstance
  readonly #startTime: number = Date.now()

  constructor (
    options: Options,
    context: RevaneFastifyContext
  ) {
    this.#options = options
    this.#context = context
    this.#server = fastify()
    this.#promise = this.#registerAccessLogger()
  }

  public initialize (): RevaneFastify {
    return this.register(fastifyCookie, {})
  }

  public register (plugin: string | FastifyPluginCallback, options: any): RevaneFastify {
    this.#promise = this.#registerAsync(plugin, options)
    return this
  }

  public registerControllers (): RevaneFastify {
    this.#promise = this.registerControllersAsync()
    return this
  }

  private async registerControllersAsync (): Promise<void> {
    await this.#promise
    const controllers = await this.#context.getByComponentType('controller')
    for (const controller of controllers) {
      if (isDecoratorDriven(controller)) {
        this.#server.register(buildPlugin(controller))
      } else {
        this.#registerPlugin(controller)
      }
    }
  }

  public registerGlobalErrorHandler (): RevaneFastify {
    this.#promise = this.#registerGlobalErrorHandlerAsync()
    return this
  }

  public async listen (addressProviderId: string): Promise<string> {
    await this.#logApplication()
    await this.#promise
    const options = await this.#getHostAndPort(addressProviderId)
    const address = await this.#server.listen({
      port: options.port, 
      host: options.host
    })
    await this.#logFastifyStartSuccessful()
    return address
  }

  public async close (): Promise<void> {
    // tslint disable-next-line
    return await this.#server.close()
  }

  public unref(): void {
    this.#server.server.unref()
  }

  public printRoutes(): string {
    return this.#server.printRoutes()
  }

  public port (): number {
    const addressInfo: any = this.#server.server.address()
    return addressInfo.port
  }

  public ready (callback: (err?: Error, fastify?: FastifyInstance<Server, IncomingMessage, ServerResponse>) => void): RevaneFastify {
    this.#promise = this.#promise
      .then(async () => {
        return await new Promise((resolve, reject) => {
          this.#server.ready()
            .then(
              () => {
                if (callback) {
                  callback(null, this.#server)
                }
                resolve(null)
              },
              (err) => {
                if (callback) {
                  callback(err, this.#server)
                }
                reject(err)
              })
        })
      })
    return this
  }

  public setErrorHandler (handler: string | ((error: Error, request: FastifyRequest, reply: FastifyReply) => void)): RevaneFastify {
    this.#promise = this.#setErrorHandlerAsync(handler)
    return this
  }

  async #setErrorHandlerAsync (handler: string | ((error: Error, request: FastifyRequest, reply: FastifyReply) => void)): Promise<void> {
    await this.#promise
    if (typeof handler === 'string') {
      const errorHandler = await this.#context.getById(handler)
      this.#server.setErrorHandler(errorHandler.errorHandler)
    } else {
      this.#server.setErrorHandler(handler)
    }
  }

  public setNotFoundHandler (handler: string | ((request: FastifyRequest, reply: FastifyReply) => void)): RevaneFastify {
    this.#promise = this.#setNotFoundHandlerAsync(handler)
    return this
  }

  async #setNotFoundHandlerAsync (handler: string | ((request: FastifyRequest, reply: FastifyReply) => void)): Promise<void> {
    await this.#promise
    if (typeof handler === 'string') {
      const notFoundHandler = await this.#context.getById(handler)
      this.#server.setNotFoundHandler(notFoundHandler.notFoundHandler)
    } else {
      this.#server.setNotFoundHandler(handler)
    }
  }

  public after (handler: (err: Error) => void): RevaneFastify {
    this.#promise = this.#promise
      .then(() => this.#server.after(handler))
    return this
  }

  #registerPlugin (plugin: Controller): void {
    if (isBindable(plugin.plugin)) {
      plugin.plugin = plugin.plugin.bind(plugin)
    }
    if (!isPlugin(plugin.plugin)) {
      plugin.plugin = fastifyPlugin(plugin.plugin)
    }
    const opts = plugin.options || {}
    this.#server.register(plugin.plugin, opts)
  }

  async #registerGlobalErrorHandlerAsync (): Promise<void> {
    await this.#promise
    const controllerAdvices = await this.#context.getByComponentType('controlleradvice')
    const errorHandler = buildGlobalErrorHandler(controllerAdvices)
    if (errorHandler != null) {
      this.#server.setErrorHandler(errorHandler as any)
    }
  }

  async #registerAsync (plugin: string | FastifyPluginCallback, options: any): Promise<void> {
    await this.#promise
    if (typeof plugin === 'string') {
      const pluginById = await this.#context.getById(plugin)
      if (isDecoratorDriven(pluginById)) {
        this.#server.register(buildPlugin(pluginById))
      } else {
        this.#registerPlugin(pluginById)
      }
    } else {
      this.#server.register(plugin, options)
    }
  }

  async #getHostAndPort (addressProviderId?: string): Promise<{host: string, port: number}> {
    let host: string
    let port: number
    if (typeof addressProviderId === 'string') {
      const addressProvider = await this.#context.getById(addressProviderId)
      if (await addressProvider.has(this.#options.hostKey || 'revane.server.host')) {
        host = addressProvider.get(this.#options.hostKey || 'revane.server.host')
      } else {
        host = 'localhost'
      }
      if (await addressProvider.has(this.#options.portKey || 'revane.server.port')) {
        port = addressProvider.get(this.#options.portKey || 'revane.server.port')
      } else {
        port = 3000
      }
    } else {
      host = this.#options.host
      port = this.#options.port
    }
    return { host, port }
  }

  async #logApplication (): Promise<void> {
    if (!this.#options.silent && await this.#context.hasById('rootLogger')) {
      const logger = await this.#context.getById('rootLogger')
      logger.info(`Starting Application using Node.js ${process.version} on ${hostname()} with PID ${process.pid}`)
    }
  }

  async #logFastifyStartSuccessful (): Promise<void> {
    if (!this.#options.silent && await this.#context.hasById('rootLogger')) {
      const logger = await this.#context.getById('rootLogger')
      logger.info(`Fastify started on port: ${this.port()}`)
      const startUpTime = Date.now() - this.#startTime
      logger.info(`Startup in ${startUpTime} ms`)
    }
  }

  async #registerAccessLogger () {
    if (!this.#options.silent && await this.#context.hasById('rootLogger')) {
      const logger = await this.#context.getById('rootLogger')
      if (await this.#accessLogEnabled()) {
        this.#server.addHook('onRequest', async (request: FastifyRequest, _: FastifyReply) => {
          logger.info(`${request.method} ${request.url}`)
        })
      }
    }
  }

  async #accessLogEnabled(): Promise<boolean> {
    const configuration = await this.#context.getById('configuration')
    if (configuration == null) {
      return true
    }
    return !configuration.has(ACCESS_LOG_ENABLED) ? true : configuration.getBoolean(ACCESS_LOG_ENABLED)
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
