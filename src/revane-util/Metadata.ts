import "polyfill-symbol-metadata";

export function setMetadata(
  sym: any,
  value: any,
  target: object,
  context?: ClassDecoratorContext | ClassMethodDecoratorContext,
) {
  if (typeof context !== "object") {
    target[Symbol.metadata] ??= {};
    target[Symbol.metadata]![sym] = value;
  } else {
    context.metadata[sym] = value;
  }
}

export function getMetadata(sym: any, target: object): any | null {
  target[Symbol.metadata] ??= {};
  return (
    target[Symbol.metadata]![sym] ?? (target["metadata"] ?? {})[sym] ?? null
  );
}
