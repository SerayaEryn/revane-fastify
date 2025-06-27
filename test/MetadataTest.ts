import test from "ava";
import { setMetadata } from "../src/revane-util/Metadata.js";

test("should add metadata - case ecmascript decorators", (t) => {
  const context = {
    metadata: {},
  } as unknown as ClassDecoratorContext;
  const target = new Test();

  setMetadata("test", "hallo welt", target, context);

  t.is(context.metadata["test"], "hallo welt");
});

test("should add metadata - case legacy decorators", (t) => {
  const target = new Test();

  setMetadata("test", "hallo welt", target);

  t.is(target[Symbol.metadata]["test"], "hallo welt");
});

class Test {}
