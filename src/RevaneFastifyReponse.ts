import { FastifyReply } from 'fastify'
import { RevaneResponse } from './RevaneResponse'

export class RevaneFastifyResponse implements RevaneResponse {
  constructor (private readonly reply: FastifyReply) {}

  redirect (status: any, url?: any): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.reply.redirect(status, url)
  }

  status (statusCode: number): RevaneResponse {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.reply.status(statusCode)
    return this
  }

  getHeader (name: string): string {
    return this.reply.getHeader(name)
  }

  setHeader (name: string, value: any): RevaneResponse {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.reply.header(name, value)
    return this
  }
}
