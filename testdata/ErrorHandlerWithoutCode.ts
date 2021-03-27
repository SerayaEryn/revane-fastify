import {
  Get,
  ResponseStatus,
  ErrorHandler
} from '../src/Decorators'

export class UserController {
  @Get('/error1')
  async error1 (request, reply): Promise<string> {
    const error: any = new Error()
    error.code = 'ERR1'
    throw error
  }

  @ErrorHandler
  @ResponseStatus(418)
  async handleBlubb (ignore, request, reply): Promise<string> {
    return 'allerrors'
  }
}
