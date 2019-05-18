import {
  Get,
  Param,
  Reply,
  Query,
  Header,
  Cookie,
  All,
  QueryParameters,
  RequestBody,
  Body,
  Headers,
  Params,
  Log,
  Cookies,
  Post
} from '../src/Decorators'

export class UserController {
  @Get('/user')
  user (request, reply) {
    reply.send('hello world')
  }

  @All('/something')
  async something (request, reply) {
    return 'hello world'
  }

  @Get('/user/:id')
  getParam (@Param() id) {
    return id
  }

  @Get('/user2/:id')
  getParams (@Params params) {
    return typeof params === 'object'
  }

  @Get('/header')
  getHeader (@Header('x-test') header) {
    return header
  }

  @Get('/headers')
  getHeaders (@Headers headers) {
    return typeof headers === 'object'
  }

  @Get('/users/:country')
  getUsers (@Param country, @Query() ids) {
    return country + ids
  }

  @Get('/error')
  error (@Reply() reply) {
    reply.setHeader('test', 'booom')
    reply.status(500)
    return reply.getHeader('test')
  }

  @Get('/gone')
  redirect (@Reply() reply) {
    reply.redirect('/error')
  }

  @Get('/cookie')
  getCookie (@Cookie test) {
    return test
  }

  @Get('/cookies')
  getCookies (@Cookies cookies) {
    return typeof cookies === 'object'
  }

  @Get('/log')
  getLog (@Log log) {
    return log !== undefined
  }

  @Get('/queryParameters')
  getQueryParameters (@QueryParameters query) {
    return typeof query === 'object'
  }

  @Post('/post')
  async post (@Body test) {
    return test
  }

  @Post('/requestpost')
  async requestpost (@RequestBody body) {
    return typeof body === 'object'
  }
}
