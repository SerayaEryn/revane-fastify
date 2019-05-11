import { Get, Param, Reply, Query } from '../src/Decorators'

export class UserController {
  @Get('/user')
  user (request, reply) {
    reply.send('hello world')
  }

  @Get('/user/:id')
  userById (@Param id) {
    return id
  }

  @Get('/users/:country')
  getUsers (@Param country, @Query ids) {
    return country + ids
  }

  @Get('/error')
  error (@Reply reply) {
    reply.setHeader('test', 'booom')
    reply.status(500)
    return reply.getHeader('test')
  }

  @Get('/gone')
  redirect (@Reply reply) {
    reply.redirect('/error')
  }
}
