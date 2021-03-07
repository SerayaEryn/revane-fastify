import { IncomingHttpHeaders } from 'http'

export interface RevaneRequest {
  url (): string
  cookies (): { [cookieName: string]: string }
  headers (): IncomingHttpHeaders
  query (): unknown
  params (): unknown
  protocol (): string
  method (): string
  hostname (): string
  ip (): string
}
