import { Parameter } from "../Parameter.js";
import { getMetadata } from "../revane-util/Metadata.js";
import { routesSym } from "../Symbols.js";
import { BeanAndMethod } from "./BeanAndMethod.js";
import { ModelAttributeProvider } from "./ModelAttributeProvider.js";

export function extractModelAttributProviders(
  target,
  sourceMethodName: string,
  modelAttributeBeans: Map<string, BeanAndMethod>,
): Map<string, ModelAttributeProvider> {
  const routes: object | null = getMetadata(routesSym, target);

  if (routes == null) {
    return new Map();
  }
  const routeName = Object.keys(routes).filter(
    (key) => routes[key].handlerFunction === sourceMethodName,
  )[0];
  if (routeName == null) {
    return new Map();
  }
  const modelAttribteProviders = new Map<string, ModelAttributeProvider>();

  Array.from(routes[routeName].parameters)
    .filter((parameter: Parameter) => parameter.type === "model-attribute")
    .forEach((parameter: Parameter) => {
      const bean = modelAttributeBeans.get(parameter.name).bean;
      const targetMethodName = modelAttributeBeans.get(parameter.name).method;

      const routes = Reflect.getMetadata(routesSym, bean);
      modelAttribteProviders.set(
        parameter.name,
        new ModelAttributeProvider(
          routes[targetMethodName].parameters as Parameter[],
          bean[targetMethodName].bind(bean),
        ),
      );
    });
  return modelAttribteProviders;
}
