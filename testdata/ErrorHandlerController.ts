import {
  Get,
  ResponseStatus,
  ErrorHandler
} from '../src/Decorators.js'

export class ErrorHandlerController {
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

  @ErrorHandler('ERR1')
  @ResponseStatus(505)
  async handleError1 (ignore, request, reply): Promise<string> {
    return 'err1'
  }

  @ErrorHandler
  async handleError2 (ignore, request, reply): Promise<string> {
    return 'allerrors'
  }
}
