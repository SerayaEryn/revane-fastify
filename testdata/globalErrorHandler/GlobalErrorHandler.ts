import { ResponseStatus, ErrorHandler } from '../../src/Decorators.js'

export class GlobalErrorHandler {
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
