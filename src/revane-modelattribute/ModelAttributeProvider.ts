import { FastifyRequest } from "fastify";
import { Parameter } from "../revane-controllers/Parameter.js";
import { applyParameter } from "../revane-controllers/DecoratorDriven.js";

export class ModelAttributeConverter {
  constructor(
    private parameters: Parameter[],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    private converter: Function,
  ) {}

  async convert(request: FastifyRequest) {
    const args = this.parameters.map((it) => applyParameter(request, it));
    return await this.converter(...args);
  }
}
