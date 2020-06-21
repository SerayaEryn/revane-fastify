import 'reflect-metadata'
import { parse } from 'acorn'
import { decoratorDrivenSym, routesSym } from './Symbols'

function createMethodDecorator (method: string | string[]): Function {
  return function methodDecorator (url: string, options?: any) {
    return function decorate (target, propertyKey: string, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata(decoratorDrivenSym, true, target)
      const routes = Reflect.getMetadata(routesSym, target) || {}
      const handlerFunction = propertyKey
      if (!routes[propertyKey]) {
        routes[propertyKey] = { method, url, options, handlerFunction }
      } else {
        routes[propertyKey].method = method
        routes[propertyKey].url = url
        routes[propertyKey].options = options
        routes[propertyKey].handlerFunction = handlerFunction
      }
      Reflect.defineMetadata(routesSym, routes, target)
    }
  }
}

function createRequestSubValueParameterDecorator (type: string): Function {
  return function parameterDecorator (maybeName: string | Object, maybePropertyKey?: string | symbol, maybeParameterIndex?: number) {
    if (typeof maybeName === 'string' || maybeName === undefined) {
      return function decorate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        addParameterMetadata(target, maybeName as string, propertyKey, parameterIndex, type, false)
      }
    } else {
      addParameterMetadata(maybeName, null, maybePropertyKey, maybeParameterIndex, type, false)
    }
  }
}

function createRequestValueParameterDecorator (type: string) {
  return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    addParameterMetadata(target, type, propertyKey, parameterIndex, type, true)
  }
}

function addParameterMetadata (target: Object, maybeName: string, propertyKey: string | symbol, parameterIndex: number, type: string, all: boolean) {
  let routes = Reflect.getMetadata(routesSym, target)
  const name = maybeName ? maybeName : getName(target, propertyKey, parameterIndex)
  if (!routes) {
    routes = {}
  }
  if (!routes[propertyKey]) {
    routes[propertyKey] = { parameters: [] }
  }
  routes[propertyKey].parameters.unshift({ type, name, all })
  Reflect.defineMetadata(routesSym, routes, target)
}

function getName (target: Object, propertyKey: string | symbol, parameterIndex: number): string {
  let functionSource = target[propertyKey].toString()
  if (functionSource.startsWith('async')) {
    functionSource = 'async function ' + functionSource.substring(6)
  } else {
    functionSource = 'function ' + functionSource
  }
  const ast = parse(functionSource) as any
  return ast.body[0].params[parameterIndex].name
}

const Query = createRequestSubValueParameterDecorator('query')
const Param = createRequestSubValueParameterDecorator('params')
const Cookie = createRequestSubValueParameterDecorator('cookies')
const Body = createRequestSubValueParameterDecorator('body')
const Header = createRequestSubValueParameterDecorator('headers')

export { Query, Param, Cookie, Body, Header }

const Reply = createRequestSubValueParameterDecorator('reply')

export { Reply }

const Cookies = createRequestValueParameterDecorator('cookies')
const Params = createRequestValueParameterDecorator('params')
const QueryParameters = createRequestValueParameterDecorator('query')
const RequestBody = createRequestValueParameterDecorator('body')
const Headers = createRequestValueParameterDecorator('headers')
const Log = createRequestValueParameterDecorator('log')

export { Cookies, Params, Headers, Log, QueryParameters, RequestBody }

const Get = createMethodDecorator('GET')
const Post = createMethodDecorator('POST')
const Put = createMethodDecorator('PUT')
const Delete = createMethodDecorator('DELETE')
const Patch = createMethodDecorator('PATCH')
const Head = createMethodDecorator('HEAD')
const Options = createMethodDecorator('OPTIONS')
const All = createMethodDecorator([ 'GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'OPTIONS'])

export { Get, Post, Put, Delete, Patch, Head, Options, All }
