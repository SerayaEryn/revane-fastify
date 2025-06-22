export function setMetadata(
  sym: any,
  value: any,
  target: any,
  context?: ClassDecoratorContext | ClassMethodDecoratorContext,
) {
  if (typeof context !== "object") {
    Reflect.defineMetadata(sym, value, target);
  } else {
    context.metadata![sym] = value;
  }
}

export function getMetadata(sym: any, target: any): any {
  return Reflect.getMetadata(sym, target) ?? target[Symbol["metadata"]] ?? null;
}
