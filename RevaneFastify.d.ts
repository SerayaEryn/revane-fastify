import { IncomingMessage, ServerResponse, Server } from 'http';
import { Http2Server, Http2ServerRequest, Http2ServerResponse } from 'http2'
import { RegisterOptions, Plugin, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

type HttpServer = (Server | Http2Server)
type HttpRequest = (IncomingMessage | Http2ServerRequest)
type HttpResponse = (ServerResponse | Http2ServerResponse)

export interface BeanProvider {
  get (id: string): any
  has (id: string): boolean
  getByType (type: string): any
}

export default class RevaneFastify {
  constructor (options, beanProvider: BeanProvider);
  server: FastifyInstance
  use (middleware: (req: IncomingMessage, res: ServerResponse, next: Function) => void): RevaneFastify
  register (plugin: string | any)
  register<T extends RegisterOptions<HttpServer, HttpRequest, HttpResponse>>(plugin: string | Plugin<HttpServer, HttpRequest, HttpResponse, T>, options?: T): RevaneFastify
  registerControllers (): RevaneFastify
  listen (addressProviderId: string): Promise<string>
  close (): Promise<void>
  port (): string
  ready (callback: (err?: Error) => void): RevaneFastify
  setErrorHandler(handler: (error: Error, request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): RevaneFastify
  setErrorHandler(id: string): RevaneFastify
  setNotFoundHandler(handler: (request: FastifyRequest<HttpRequest>, reply: FastifyReply<HttpResponse>) => void): RevaneFastify
  setNotFoundHandler(id: string): RevaneFastify
  after(afterListener: (err: Error) => void): RevaneFastify
  after(afterListener: (err: Error, done: Function) => void): RevaneFastify
  after(afterListener: (err: Error, context: FastifyInstance<HttpServer, HttpRequest, HttpResponse>, done: Function) => void): RevaneFastify
}
