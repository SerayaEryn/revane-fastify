import 'reflect-metadata'
import { parse } from 'acorn'
import { decoratorDrivenSym, errorHandlersSym, fallbackErrorHandlerSym, routesSym } from './Symbols'
import { RevaneRequest } from './RevaneRequest'
import { RevaneResponse } from './RevaneFastify'

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

function addParameterMetadata (target: Object, maybeName: string, propertyKey: string | symbol, parameterIndex: number, type: string, all: boolean): void {
  const routes = Reflect.getMetadata(routesSym, target) || {}
  const name = maybeName || getName(target, propertyKey, parameterIndex)
  if (!routes[propertyKey]) {
    routes[propertyKey] = { parameters: [] }
  }
  routes[propertyKey].parameters.unshift({ type, name, all })
  Reflect.defineMetadata(routesSym, routes, target)
}

function getName (target: Object, propertyKey: string | symbol, parameterIndex: number): string {
  let functionSource: string = target[propertyKey].toString()
  if (functionSource.startsWith('async')) {
    functionSource = `async function ${functionSource.substring(6)}`
  } else {
    functionSource = `function ${functionSource}`
  }
  const ast = parse(functionSource, { ecmaVersion: 'latest' }) as any
  return ast.body[0].params[parameterIndex].name
}

function createErrorHandlerDecorator (): Function {
  return function decorator (targetOrErrorCode: string | any, propertyKey: string, descriptor: PropertyDescriptor): Function {
    if (typeof targetOrErrorCode === 'string') {
      return function errorHandlerDecorator (target, propertyKey: string, descriptor: PropertyDescriptor) {
        addErrorHandlerMetadata(target, propertyKey, targetOrErrorCode)
      }
    } else {
      addErrorHandlerMetadata(targetOrErrorCode, propertyKey, null)
    }
  }
}

function addErrorHandlerMetadata (target: any, propertyKey: string, errorCode?: string): void {
  if (errorCode == null) {
    const errorHandler = {
      handlerFunction: target[propertyKey],
      errorCode: '__NONE',
      handlerName: propertyKey
    }
    Reflect.defineMetadata(fallbackErrorHandlerSym, errorHandler, target)
  } else {
    const errorHandlers = Reflect.getMetadata(errorHandlersSym, target) || {}
    if (errorHandlers[propertyKey]) {
      errorHandlers[propertyKey].handlerFunction = target[propertyKey]
      errorHandlers[propertyKey].errorCode = errorCode
      errorHandlers[propertyKey].handlerName = propertyKey
    } else {
      errorHandlers[propertyKey] = {
        handlerFunction: target[propertyKey],
        errorCode,
        handlerName: propertyKey
      }
    }
    Reflect.defineMetadata(errorHandlersSym, errorHandlers, target)
  }
}

function createResponseStatusDecorator (): Function {
  return function decorator (statusCode: number): Function {
    return function responseStatusDecorator (target, propertyKey: string, descriptor: PropertyDescriptor) {
      const errorHandlers = Reflect.getMetadata(errorHandlersSym, target) || {}
      if (errorHandlers[propertyKey]) {
        errorHandlers[propertyKey].statusCode = statusCode
      } else {
        errorHandlers[propertyKey] = { statusCode }
      }
      Reflect.defineMetadata(errorHandlersSym, errorHandlers, target)
    }
  }
}

export class ErrorHandlerDefinition {
  handlerFunction: (error: Error, request: RevaneRequest, response: RevaneResponse) => Promise<any>
  errorCode: string
  statusCode?: number
  handlerName: string
}

const Query = createRequestSubValueParameterDecorator('query')
const Param = createRequestSubValueParameterDecorator('params')
const Cookie = createRequestSubValueParameterDecorator('cookies')
const Header = createRequestSubValueParameterDecorator('headers')

export { Query, Param, Cookie, Header }

const Response = createRequestSubValueParameterDecorator('reply')
const Request = createRequestSubValueParameterDecorator('request')

export { Response, Request }

const Cookies = createRequestValueParameterDecorator('cookies')
const Params = createRequestValueParameterDecorator('params')
const QueryParameters = createRequestValueParameterDecorator('query')
const Body = createRequestValueParameterDecorator('body')
const Headers = createRequestValueParameterDecorator('headers')
const Log = createRequestValueParameterDecorator('log')

export { Cookies, Params, Headers, Log, QueryParameters, Body }

const Get = createMethodDecorator('GET')
const Post = createMethodDecorator('POST')
const Put = createMethodDecorator('PUT')
const Delete = createMethodDecorator('DELETE')
const Patch = createMethodDecorator('PATCH')
const Head = createMethodDecorator('HEAD')
const Options = createMethodDecorator('OPTIONS')
const All = createMethodDecorator(
  ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE', 'OPTIONS']
)

export { Get, Post, Put, Delete, Patch, Head, Options, All }

const ErrorHandler = createErrorHandlerDecorator()
const ResponseStatus = createResponseStatusDecorator()

export { ErrorHandler, ResponseStatus }
