import { FastifyRequest } from 'fastify'
import { IncomingHttpHeaders } from 'http'
import { RevaneRequest } from './RevaneRequest'

export class RevaneFastifyRequest implements RevaneRequest {
  constructor (private readonly request: FastifyRequest) {}

  public url (): string {
    return this.request.url
  }

  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  public cookies (): { [cookieName: string]: string } {
    return this.request.cookies
  }

  public headers (): IncomingHttpHeaders {
    return this.request.headers
  }

  public query (): unknown {
    return this.request.query
  }

  public params (): unknown {
    return this.request.params
  }

  public protocol (): string {
    return this.request.protocol
  }

  public method (): string {
    return this.request.method
  }

  public hostname (): string {
    return this.request.hostname
  }

  public ip (): string {
    return this.request.ip
  }
}
