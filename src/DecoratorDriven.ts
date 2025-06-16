import {
  FastifyInstance,
  RouteOptions,
  FastifyPluginCallback,
  RouteHandlerMethod,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { ErrorHandlerDefinition } from './Decorators'
import { RevaneFastifyResponse } from './RevaneFastifyReponse'
import { RevaneFastifyRequest } from './RevaneFastifyRequest'
import {
  decoratorDrivenSym,
  errorHandlersSym,
  fallbackErrorHandlerSym,
  routesSym
} from './Symbols'

interface Parameter {
  type: string
  name: string
  all: boolean
}

export function isDecoratorDriven (target): boolean {
  return Reflect.getMetadata(decoratorDrivenSym, target) === true
}

export function buildPlugin (target): FastifyPluginCallback {
  const routes = Reflect.getMetadata(routesSym, target)
  const errorHandler = buildErrorHandler(target)
  function plugin (fastify: FastifyInstance, options: FastifyPluginOptions, next): void {
    for (const key in routes) {
      const route: any = routes[key]
      const options: RouteOptions = route.options || {}
      options.url = route.url
      options.method = route.method
      if (!options.url || !options.method) {
        continue
      }
      const boundHandler = target[route.handlerFunction].bind(target)
      if (route.parameters) {
        options.handler = buildHandler(route.parameters || [], boundHandler)
      } else {
        options.handler = boundHandler as RouteHandlerMethod
      }
      if (errorHandler != null) {
        options.errorHandler = errorHandler
      }
      fastify.route(options)
    }
    next()
  }
  return fastifyPlugin(plugin)
}

type ErrorHandler = (
  error: NodeJS.ErrnoException,
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<void>

export function buildGlobalErrorHandler (
  controllerAdvices: any[]
): ErrorHandler | null {
  const controllerAdvicesWithHandler = controllerAdvices
    .filter((controllerAdvice) => isErrorHandler(controllerAdvice))
  if (controllerAdvicesWithHandler.length > 0) {
    return buildErrorHandler(controllerAdvicesWithHandler[0])
  } else {
    return null
  }
}

function isErrorHandler (controllerAdvice: any): unknown {
  return Reflect.getMetadata(errorHandlersSym, controllerAdvice) != null ||
    Reflect.getMetadata(fallbackErrorHandlerSym, controllerAdvice) != null
}

export function buildErrorHandler (target): ErrorHandler | null {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  const errorHandlers: { [cookieName: string]: ErrorHandlerDefinition } =
    Reflect.getMetadata(errorHandlersSym, target) || {}
  const fallbackErrorHandler: ErrorHandlerDefinition =
    Reflect.getMetadata(fallbackErrorHandlerSym, target)
  if (Object.keys(errorHandlers).length > 0 || fallbackErrorHandler != null) {
    return async function errorHander (
      error: NodeJS.ErrnoException,
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      for (const key of Object.keys(errorHandlers)) {
        const errorHandler = errorHandlers[key]
        if (errorHandler.errorCode === error.code) {
          reply.status(errorHandler.statusCode || 500)
          return errorHandler.handlerFunction.bind(target)(
            error,
            new RevaneFastifyRequest(request),
            new RevaneFastifyResponse(reply))
        }
      }
      if (fallbackErrorHandler != null) {
        reply.status(fallbackErrorHandler.statusCode || errorHandlers[fallbackErrorHandler.handlerName]?.statusCode || 500)
        return fallbackErrorHandler.handlerFunction.bind(target)(
          error,
          new RevaneFastifyRequest(request),
          new RevaneFastifyResponse(reply))
      }
      throw error
    }
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function buildHandler (parameters: Parameter[], handler: Function): RouteHandlerMethod {
  const src = buildHandlerString(parameters)
  const handlerFunction = new Function(
    'handler',
    'RevaneFastifyReply',
    'RevaneFastifyRequest',
    src
  )
  return handlerFunction(handler, RevaneFastifyResponse, RevaneFastifyRequest)
}

function buildHandlerString (parameters: Parameter[]): string {
  return 'return async function route (request, reply) {\n' +
    `  return await handler(${buildArgsString(parameters)})\n` +
    '}'
}

function buildArgsString (parameters: Parameter[]): string {
  const args = []
  for (const parameter of parameters) {
    if (parameter.type === 'reply') {
      args.push('new RevaneFastifyReply(reply)')
    } else if (parameter.type === 'request') {
      args.push('new RevaneFastifyRequest(request)')
    } else {
      if (parameter.all) {
        args.push(`request['${parameter.type}']`)
      } else {
        args.push(`request['${parameter.type}']['${parameter.name}']`)
      }
    }
  }
  return args.join(', ')
}
