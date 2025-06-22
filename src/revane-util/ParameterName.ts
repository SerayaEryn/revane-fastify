import { parse } from "acorn";

export function parameterName(
  target: object,
  propertyKey: string | symbol,
  parameterIndex: number,
): string {
  let functionSource: string = target[propertyKey].toString();
  if (functionSource.startsWith("async")) {
    functionSource = `async function ${functionSource.substring(6)}`;
  } else {
    functionSource = `function ${functionSource}`;
  }
  const ast = parse(functionSource, { ecmaVersion: "latest" }) as any;
  return ast.body[0].params[parameterIndex].name;
}
