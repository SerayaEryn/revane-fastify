import { Parameter, ParameterType } from "../revane-controllers/Parameter.js";
import { BeanAndMethod } from "./BeanAndMethod.js";
import { MissingModelAttributeConverter } from "./MissingModelAttributeConverter.js";
import { ModelAttributeConverter } from "./ModelAttributeProvider.js";

export function modelAttributConvertersForParameters(
  parameters: Parameter[],
  modelAttributeBeans: Map<string, BeanAndMethod>,
): Map<string, ModelAttributeConverter> {
  const modelAttribteProviders = new Map<string, ModelAttributeConverter>();

  parameters
    .filter((parameter) => parameter.type === ParameterType.MODEL_ATTRIBUTE)
    .forEach((parameter) => {
      const beanAndMethod = modelAttributeBeans.get(parameter.name);
      if (beanAndMethod == null) {
        throw new MissingModelAttributeConverter(parameter.name);
      }
      modelAttribteProviders.set(parameter.name, beanAndMethod.toConverter());
    });
  return modelAttribteProviders;
}
