import { Get, ModelAttribute } from "../src/RevaneFastify.js";
import { Something } from "./ModelAttributeBean.js";

export class ModelAttributeControllerMissing {
  @Get('/user')
  async user (@ModelAttribute hallo: Something): Promise<string> {
    return "42"
  }
}