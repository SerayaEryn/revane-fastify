import { ModelAttribute, Query } from "../src/RevaneFastify.js";

export class ModelAttributeBean {
  @ModelAttribute("test")
  modelAttribute(@Query test: string) {
    return new Something(test)
  }
}

export class Something {
  constructor(public value: string) {

  }
}