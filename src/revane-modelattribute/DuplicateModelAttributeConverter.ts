export const REV_ERR_DUPLICATE_MODEL_ATTRIBUTE_CONVERTER =
  "REV_ERR_DUPLICATE_MODEL_ATTRIBUTE_CONVERTER";

export class DuplicateModelAttributeConverter extends Error {
  public code = REV_ERR_DUPLICATE_MODEL_ATTRIBUTE_CONVERTER;

  constructor(public name: string) {
    super(`Duplicate ModelAttribute Converter with name '${name}'`);
    Error.captureStackTrace(this, DuplicateModelAttributeConverter);
  }
}
