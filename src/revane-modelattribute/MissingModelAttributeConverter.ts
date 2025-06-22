export const REV_ERR_MISSING_MODEL_ATTRIBUTE_CONVERTER =
  "REV_ERR_MISSING_MODEL_ATTRIBUTE_CONVERTER";

export class MissingModelAttributeConverter extends Error {
  public code = REV_ERR_MISSING_MODEL_ATTRIBUTE_CONVERTER;

  constructor(public name: string) {
    super(`Missing ModelAttribute Converter with name '${name}'`);
    Error.captureStackTrace(this, MissingModelAttributeConverter);
  }
}
