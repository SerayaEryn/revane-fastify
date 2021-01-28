import { RevaneResponse } from './RevaneResponse'
import { Reply } from './FastifyTypes'

export class RevaneFastifyResponse implements RevaneResponse {
  constructor (private reply: Reply) {}

  redirect (status: any, url?: any) {
    this.reply.redirect(status, url)
  }

  status (statusCode: number): RevaneResponse {
    this.reply.status(statusCode)
    return this
  }

  getHeader (name: string): string {
    return this.reply.getHeader(name)
  }

  setHeader (name: string, value: any): RevaneResponse {
    this.reply.header(name, value)
    return this
  }
}
