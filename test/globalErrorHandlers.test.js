import test from "ava";
import { revaneFastify } from "../src/RevaneFastify.js";
import { UserController } from "../testdata/globalErrorHandler/UserController.js";
import { GlobalErrorHandler } from "../testdata/globalErrorHandler/GlobalErrorHandler.js";
import { TestLogger } from "../testdata/TestLogger.js";
import { join } from "node:path";

const beanProvider = {
  getById(key) {
    if (key === "userController") {
      return new UserController();
    }
    if (key === "rootLogger") {
      return new TestLogger();
    }
    if (key === "configuration") {
      return {
        getString(key) {
          if (key === "revane.basePackage") {
            return join(import.meta.dirname, "../testdata");
          }
          return "";
        },
        getBooleanOrElse: () => {
          return false;
        },
      };
    }
  },
  hasById() {
    return true;
  },
  getByComponentType() {
    return Promise.resolve([new GlobalErrorHandler()]);
  },
  getByMarker() {
    return [];
  },
};

test("errorhandler with errorCode and statusCode", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance
    .register("userController")
    .registerGlobalErrorHandler()
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/error1`);
  const data = await response.text();
  t.is(response.status, 505);
  t.is(data.toString(), "err1");
  instance.close();
});

test("errorhandler without errorCode and statusCode", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance
    .registerGlobalErrorHandler()
    .register("userController")
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/error2`);
  const data = await response.text();
  t.is(response.status, 500);
  t.is(data.toString(), "allerrors");
  instance.close();
});
