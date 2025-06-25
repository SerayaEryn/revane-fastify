import test from "ava";
import { errorCodes, revaneFastify } from "../src/RevaneFastify.js";
import TestController from "../testdata/TestController.js";
import { ModelAttributeController } from "../testdata/ModelAttributeController.js";
import { TestAddressProvider } from "../testdata/TestAddressProvider.js";
import { ModelAttributeBeanDuplicate } from "../testdata/ModelAttributeBeanDuplicate.js";
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
  getByMetadata() {
    return [new ModelAttributeBeanDuplicate()];
  },
};

test("Should throw error on duplicate converter", async (t) => {
  t.plan(1);

  logger.reset();
  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);

  instance.unref();
  await t.throwsAsync(
    async () => {
      try {
        await instance.register("modelAttributeController").listen();
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    { code: errorCodes.REV_ERR_DUPLICATE_MODEL_ATTRIBUTE_CONVERTER },
  );
});
