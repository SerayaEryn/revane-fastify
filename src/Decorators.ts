import 'reflect-metadata'
import * as esprima from 'esprima'
import { decoratorDrivenSym, routesSym } from './Symbols'

function createMethodDecorator (method: string): Function {
  return function methodDecorator (url: string, options?: any) {
    return function decorate (target, propertyKey: string, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata(decoratorDrivenSym, true, target)
      const routes = Reflect.getMetadata(routesSym, target) || {}
      const handler = target[propertyKey].bind(target)
      if (!routes[propertyKey]) {
        routes[propertyKey] = { method, url, options, handler }
      } else {
        routes[propertyKey].method = method
        routes[propertyKey].url = url
        routes[propertyKey].options = options
        routes[propertyKey].handler = handler
      }
      Reflect.defineMetadata(routesSym, routes, target)
    }
  }
}

function createParameterDecorator (type: string): Function {
  return function parameterDecorator (maybeName: string | Object, maybePropertyKey?: string | symbol, maybeParameterIndex?: number) {
    if (typeof maybeName === 'string' || maybeName === undefined) {
      return function decorate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        addParameterMetadata(target, maybeName as string, propertyKey, parameterIndex, type)
      }
    } else {
      addParameterMetadata(maybeName, null, maybePropertyKey, maybeParameterIndex, type)
    }
  }
}

function addParameterMetadata (target: Object, maybeName: string, propertyKey: string | symbol, parameterIndex: number, type: string) {
  const routes = Reflect.getMetadata(routesSym, target)
  const name = maybeName ? maybeName : getName(target, propertyKey, parameterIndex)
  if (!routes[propertyKey]) {
    routes[propertyKey] = { parameters: [] }
  }
  routes[propertyKey].parameters.unshift({ type, name })
  Reflect.defineMetadata(routesSym, routes, target)
}

function getName (target: Object, propertyKey: string | symbol, parameterIndex: number): string {
  const functionSource = target[propertyKey].toString()
  const ast = esprima.parse('function ' + functionSource)
  return ast.body[0].params[parameterIndex].name
}

const Query = createParameterDecorator('query')
const Param = createParameterDecorator('params')
const Cookie = createParameterDecorator('cookies')
const Body = createParameterDecorator('body')
const Reply = createParameterDecorator('reply')
const Header = createParameterDecorator('headers')

export { Query, Param, Cookie, Body, Header, Reply }

const Get = createMethodDecorator('GET')
const Post = createMethodDecorator('POST')
const Put = createMethodDecorator('PUT')
const Delete = createMethodDecorator('DELETE')
const Patch = createMethodDecorator('PATCH')

export { Get, Post, Put, Delete, Patch }
