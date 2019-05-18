import { Get, Param, Reply, Query, Header, Cookie } from '../src/Decorators'

export class UserController {
  @Get('/user')
  user (request, reply) {
    reply.send('hello world')
  }

  @Get('/user/:id')
  userById (@Param() id) {
    return id
  }

  @Get('/header')
  getHeader (@Header('x-test') header) {
    return header
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
}
