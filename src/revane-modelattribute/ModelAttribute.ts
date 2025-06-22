import { getMetadata, setMetadata } from "../revane-util/Metadata.js";
import { parameterName } from "../revane-util/ParameterName.js";
import { addParameterMetadata } from "../RevaneFastify.js";
import { modelAttributeMethodSym } from "../Symbols.js";

export function ModelAttribute(
  target: any,
  propertyKey?: string | ClassMethodDecoratorContext,
  parameterIndex?: number | PropertyDescriptor,
): any {
  if (typeof parameterIndex === "number") {
    const name = parameterName(target, propertyKey as string, parameterIndex);
    addParameterMetadata(
      target,
      name,
      propertyKey as string,
      parameterIndex,
      "model-attribute",
      false,
    );
  } else {
    const name = target as string;
    return function (
      target: any,
      propertyKey?: string | ClassMethodDecoratorContext,
      _?: PropertyDescriptor,
    ) {
      const context = propertyKey as ClassMethodDecoratorContext;
      const key = typeof propertyKey === "string" ? propertyKey : context.name;
      const meta: Map<string, string | symbol> =
        getMetadata(modelAttributeMethodSym, target) ?? new Map();
      meta.set(name, key);
      setMetadata(modelAttributeMethodSym, meta, target, context);
      return typeof propertyKey == "string" ? undefined : target;
    };
  }
}
