import test from "ava";
import { revaneFastify } from "../src/RevaneFastify.js";
import TestController from "../testdata/TestController.js";
import { TestAddressProvider } from "../testdata/TestAddressProvider.js";
import TestHandler from "../testdata/TestHandler.js";
import { TestLogger } from "../testdata/TestLogger.js";

const logger = new TestLogger();
const revane = {
  getById(key) {
    if (key === "testController") {
      return new TestController();
    }
    if (key === "config") {
      return new TestAddressProvider();
    }
    if (key === "handler") {
      return new TestHandler();
    }
    if (key === "rootLogger") {
      return logger;
    }
    if (key === "configuration") {
      return {
        getBooleanOrElse: () => {
          return true;
        },
      };
    }
  },
  hasById() {
    return true;
  },
  getByComponentType() {
    return [new TestController()];
  },
};

test("Should compress response", async (t) => {
  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance.register("testController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/big`, {
    headers: { "accept-encoding": "gzip" },
  });
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "x".repeat(2 * 1024));
  t.is(response.headers.get("content-encoding"), "gzip");
  instance.close();
});
