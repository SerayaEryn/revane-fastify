import { Parameter } from "./Parameter.js";

export class Route {
  parameters: Parameter[];
}

export type Routes = Record<string | symbol, Route>;
