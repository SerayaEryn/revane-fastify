import fastifyPlugin from "fastify-plugin";
import test from "ava";
import { revaneFastify } from "../src/RevaneFastify.js";
import TestController from "../testdata/TestController.js";
import { ModelAttributeController } from "../testdata/ModelAttributeController.js";
import { TestAddressProvider } from "../testdata/TestAddressProvider.js";
import { ModelAttributeBean } from "../testdata/ModelAttributeBean.js";
import TestHandler from "../testdata/TestHandler.js";
import { TestLogger } from "../testdata/TestLogger.js";
import { join } from "node:path";

const logger = new TestLogger();
const revane = {
  getById(key) {
    if (key === "modelAttributeController") {
      return new ModelAttributeController();
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
        getString(key) {
          if (key === "revane.basePackage") {
            return join(import.meta.dirname, "../testdata");
          }
          return "";
        },
        getBooleanOrElse: (key) => {
          if (key === "revane.access-logging.enabled") {
            return true;
          }
          if (key === "revane.server.static-files.enabled") {
            return true;
          }
          return false;
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
  getByMarker() {
    return [new ModelAttributeBean()];
  },
};

test("Should bind and create plugin", async (t) => {
  t.plan(2);

  logger.reset();
  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance.register("modelAttributeController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/user?test=heureka`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "heureka");
  instance.close();
});
