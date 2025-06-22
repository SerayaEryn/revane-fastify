import { Routes } from "../revane-controllers/Route.js";
import { routesSym } from "../Symbols.js";
import { ModelAttributeConverter } from "./ModelAttributeProvider.js";

export class BeanAndMethod {
  constructor(
    public bean: any,
    public method: string | symbol,
  ) {}

  toConverter(): ModelAttributeConverter {
    const routes: Routes = Reflect.getMetadata(routesSym, this.bean);
    return new ModelAttributeConverter(
      routes[this.method].parameters,
      this.bean[this.method].bind(this.bean),
    );
  }
}
