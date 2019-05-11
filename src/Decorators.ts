import 'reflect-metadata'
import * as esprima from 'esprima'
import { decoratorDriven } from './Symbols'

function createMethodDecorator (method: string): Function {
  return function methodDecorator (url: string, options?: any) {
    return function decorate (target, propertyKey: string, descriptor: PropertyDescriptor) {
      Reflect.defineMetadata(decoratorDriven, true, target)
      const routes = Reflect.getMetadata('routes', target) || {}
      const handler = target[propertyKey].bind(target)
      if (!routes[propertyKey]) {
        routes[propertyKey] = { method, url, options, handler }
      } else {
        routes[propertyKey].method = method
        routes[propertyKey].url = url
        routes[propertyKey].options = options
        routes[propertyKey].handler = handler
      }
      Reflect.defineMetadata('routes', routes, target)
    }
  }
}

function createParameterDecorator (type: string): Function {
  return function decorate (target: Object, propertyKey: string | symbol, parameterIndex: number) {
    const routes = Reflect.getMetadata('routes', target)
    const functionSource = target[propertyKey].toString()
    const ast = esprima.parse('function ' + functionSource)
    const name = ast.body[0].params[parameterIndex].name
    if (!routes[propertyKey]) {
      const parameters = [ { type, name } ]
      routes[propertyKey] = { parameters }
    } else {
      routes[propertyKey].parameters.push({ type, name })
    }
    routes[propertyKey].parameters.reverse()
    Reflect.defineMetadata('routes', routes, target)
  }
}

const Query = createParameterDecorator('query')
const Param = createParameterDecorator('params')
const Cookie = createParameterDecorator('cookie')
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
