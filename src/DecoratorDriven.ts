import { FastifyInstance } from 'fastify'
import * as fastifyPlugin from 'fastify-plugin'
import {
  FastifyRouteOptions,
  FastifyRequestHandler,
  FastifyPlugin,
  PluginOptions
} from './FastifyTypes'
import { RevaneFastifyReply } from './RevaneFastifyReply'
import { decoratorDriven } from './Symbols'

type Parameter = {
  type: string,
  name: string
}
type Route = {
  url: string,
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  options: FastifyRouteOptions,
  handler: FastifyRequestHandler | Function
  parameters?: Parameter[]
}

export function isDecoratorDriven (target): boolean {
  return Reflect.getMetadata(decoratorDriven, target) === true
}

export function buildPlugin (target): FastifyPlugin {
  const routes = Reflect.getMetadata('routes', target)
  // tslint:disable-next-line: no-inner-declarations
  function plugin (fastify: FastifyInstance, options: PluginOptions, next) {
    for (const key in routes) {
      const route: Route = routes[key]
      const options = route.options || {} as FastifyRouteOptions
      options.url = route.url
      options.method = route.method
      if (route.parameters) {
        options.handler = buildHandler(route.parameters, route.handler)
      } else {
        options.handler = route.handler as FastifyRequestHandler
      }
      fastify.route(options)
    }
    next()
  }
  return fastifyPlugin(plugin)
}

function buildHandler (parameters: Parameter[], handler: Function): FastifyRequestHandler {
  const src = buildHandlerString(parameters)
  const handlerFunction = new Function('handler', 'RevaneFastifyReply', src)
  return handlerFunction(handler, RevaneFastifyReply)
}

function buildHandlerString (parameters: Parameter[]): string {
  return 'return async function route (request, reply) {\n' +
    `  return handler(${buildArgsString(parameters)})\n` +
    '}'
}

function buildArgsString (parameters: Parameter[]): string {
  let args = []
  for (const parameter of parameters) {
    if (parameter.type === 'reply') {
      args.push('new RevaneFastifyReply(reply)')
    } else {
      args.push(`request['${parameter.type}']['${parameter.name}']`)
    }
  }
  return args.join(', ')
}
