import { FastifyReply } from 'fastify'
import { RevaneResponse } from './RevaneResponse.js'

export class RevaneFastifyResponse implements RevaneResponse {
  constructor (private readonly reply: FastifyReply) {}

  redirect (status: any, url?: any): void {
    this.reply.redirect(status, url)
  }

  status (statusCode: number): RevaneResponse {
    this.reply.status(statusCode)
    return this
  }

  getHeader (name: string): string | number | string[] {
    return this.reply.getHeader(name)
  }

  setHeader (name: string, value: any): RevaneResponse {
    this.reply.header(name, value)
    return this
  }
}
