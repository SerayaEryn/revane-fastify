import {
  Get,
  Param,
  Response,
  Query,
  Header,
  Cookie,
  All,
  QueryParameters,
  Body,
  Headers,
  Params,
  Log,
  Cookies,
  Post
} from '../src/Decorators.js'
import { Request, RevaneResponse } from '../src/RevaneFastify.js'
import { RevaneRequest } from '../src/RevaneRequest.js'

export class UserController {
  @Get('/user')
  user (request, reply): void {
    reply.send('hello world')
  }

  @All('/something')
  async something (request, reply): Promise<string> {
    return 'hello world'
  }

  @Get('/user/:id')
  getParam (@Param() id: string): string {
    return id
  }

  @Get('/user2/:id')
  getParams (@Params params): boolean {
    return typeof params === 'object'
  }

  @Get('/header')
  getHeader (@Header('x-test') header: string): string {
    return header
  }

  @Get('/headers')
  getHeaders (@Headers headers): boolean {
    return typeof headers === 'object'
  }

  @Get('/users/:country')
  getUsers (@Param country: string, @Query() ids: string): string {
    return country + ids
  }

  @Get('/error')
  error (@Response() reply): string {
    reply.setHeader('test', 'booom')
    reply.status(500)
    return reply.getHeader('test')
  }

  @Get('/uri')
  async uri (@Request() request: RevaneRequest): Promise<string> {
    return request.url() +
      request.method() +
      request.protocol() +
      request.hostname()
  }

  @Get('/gone')
  redirect (@Response() reply: RevaneResponse): void {
    reply.redirect('/error')
  }

  @Get('/cookie')
  getCookie (@Cookie test: string): string {
    return test
  }

  @Get('/cookies')
  getCookies (@Cookies cookies): boolean {
    return typeof cookies === 'object'
  }

  @Get('/log')
  getLog (@Log log): boolean {
    return log !== undefined
  }

  @Get('/queryParameters')
  getQueryParameters (@QueryParameters query): boolean {
    return typeof query === 'object'
  }

  @Post('/requestpost')
  async requestpost (@Body body): Promise<boolean> {
    return typeof body === 'object'
  }
}
