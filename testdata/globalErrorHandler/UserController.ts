import { Get } from '../../src/revane-controllers/Decorators.js'

export class UserController {
  @Get('/error1')
  async error1 (request, reply): Promise<string> {
    const error: any = new Error()
    error.code = 'ERR1'
    throw error
  }

  @Get('/error2')
  async error2 (request, reply): Promise<string> {
    const error: any = new Error()
    error.code = 'ERR2'
    throw error
  }
}
