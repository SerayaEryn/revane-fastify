import { Get, ModelAttribute } from "../src/RevaneFastify.js";
import { Something } from "./ModelAttributeBean.js";

export class ModelAttributeController {
  @Get('/user')
  async user (@ModelAttribute test: Something): Promise<string> {
    return test.value
  }
}