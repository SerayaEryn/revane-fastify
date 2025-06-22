import { ModelAttribute, Query } from "../src/RevaneFastify.js";

export class ModelAttributeBeanDuplicate {
  @ModelAttribute("test")
  modelAttribute1(@Query test: string) {
    return new Something(test)
  }

  @ModelAttribute("test")
  modelAttribute2(@Query test: string) {
    return new Something(test)
  }
}

export class Something {
  constructor(public value: string) {

  }
}