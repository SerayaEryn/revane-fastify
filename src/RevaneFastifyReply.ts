import { RevaneReply } from './RevaneReply'
import { Reply } from './FastifyTypes'

export class RevaneFastifyReply implements RevaneReply {
  private reply: Reply

  constructor (reply: Reply) {
    this.reply = reply
  }

  redirect (status: any, url?: any) {
    this.reply.redirect(status, url)
  }

  status (statusCode: number): RevaneReply {
    this.reply.status(statusCode)
    return this
  }

  getHeader (name: string): string {
    return this.reply.getHeader(name)
  }

  setHeader (name: string, value: any): void {
    this.reply.header(name, value)
  }
}
