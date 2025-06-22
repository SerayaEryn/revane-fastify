import { Parameter } from "../Parameter.js";

export class ModelAttributeProvider {
  constructor(
    public parameters: Parameter[],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    public provider: Function,
  ) {}
}
