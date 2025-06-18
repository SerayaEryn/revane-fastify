import fastifyPlugin from "fastify-plugin";
import test from "ava";
import { revaneFastify } from "../src/RevaneFastify.js";
import TestController from "../testdata/TestController.js";
import TestController2 from "../testdata/TestController2.js";
import { TestAddressProvider } from "../testdata/TestAddressProvider.js";
import TestHandler from "../testdata/TestHandler.js";
import { TestLogger } from "../testdata/TestLogger.js";

const logger = new TestLogger();
const revane = {
  getById(key) {
    if (key === "testController") {
      return new TestController();
    }
    if (key === "testController2") {
      return new TestController2();
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
  },
  hasById() {
    return true;
  },
  getByComponentType() {
    return [new TestController()];
  },
};

test("Should register controller", (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  return instance
    .register("testController")
    .ready((ignore, instance) => {
      t.truthy(instance);
    })
    .listen()
    .then(() => {
      t.truthy(instance.port());
      instance.close();
    })
    .catch(console.error);
});

test("Should bind and create plugin", async (t) => {
  t.plan(3);

  logger.reset();
  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance.register("testController2").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "test");
  instance.close();
  t.true(logger.messages.includes("GET /"));
});

test("Should register plugin", (t) => {
  t.plan(1);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  return instance
    .register(fastifyPlugin(plugin))
    .ready()
    .listen()
    .then(() => {
      t.truthy(instance.port());
      instance.close();
    });
});

test("Should call after", (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  return instance
    .register(fastifyPlugin(plugin))
    .after((err) => t.falsy(err))
    .ready()
    .listen()
    .then(() => {
      t.truthy(instance.port());
      instance.close();
    });
});

test("Should set not found handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance
    .setNotFoundHandler(function (request, reply) {
      reply.code(404);
      reply.send("test");
    })
    .ready()
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/test`);
  const data = await response.text();
  t.is(response.status, 404);
  t.is(data.toString(), "test");
  instance.close();
});

test("Should set not found handler by id", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance.setNotFoundHandler("handler").ready().listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/test`);
  const data = await response.text();
  t.is(response.status, 404);
  t.is(data.toString(), "test");
  instance.close();
});

test("Should set error handler by id", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance
    .register(
      fastifyPlugin((instance, opts, next) => {
        instance.get("/", function (request, reply) {
          reply.send(new Error());
        });
        next();
      }),
    )
    .setErrorHandler("handler")
    .ready()
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/`);
  const data = await response.text();
  t.is(response.status, 500);
  t.is(data.toString(), "test");
  instance.close();
});

test("Should set error handler", async (t) => {
  t.plan(3);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance
    .register(
      fastifyPlugin((instance, opts, next) => {
        instance.get("/", function (request, reply) {
          reply.send(new Error());
        });
        next();
      }),
    )
    .setErrorHandler(function (error, request, reply) {
      t.truthy(error);
      reply.code(500).send("test");
    })
    .ready()
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/`);
  const data = await response.text();
  t.is(response.status, 500);
  t.is(data.toString(), "test");
  instance.close();
});

test("Should start server", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance
    .register("testController")
    .register(fastifyPlugin(plugin))
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "test");
  instance.close();
});

test("Should start server using addressProvider", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
    silent: true,
  };
  const instance = revaneFastify(options, revane);
  await instance
    .register("testController")
    .register(fastifyPlugin(plugin))
    .listen("config");
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "test");
  instance.close();
});

test("Should start server using addressProvider and registerControllers", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  await instance
    .registerControllers()
    .register(fastifyPlugin(plugin))
    .listen("config");
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "test");
  instance.close();
});

test("listen should call callback with string", async (t) => {
  t.plan(1);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  const address = await instance
    .registerControllers()
    .register(fastifyPlugin(plugin))
    .listen("config");
  t.true(typeof address === "string");
  instance.close();
});

test("should register plugin without name", async (t) => {
  t.plan(1);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, revane);
  const address = await instance
    .registerControllers()
    .register(fastifyPlugin((instance, options, next) => next()))
    .listen("config");
  t.true(typeof address === "string");
  instance.close();
});

test("Should handle error in plugin in listen", (t) => {
  t.plan(1);

  const options = {
    port: 0,
  };
  return revaneFastify(options, revane)
    .register(errorPlugin)
    .listen()
    .catch((err) => {
      t.truthy(err);
    });
});

test("Should handle error in plugin in ready", (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  return revaneFastify(options, revane)
    .register(errorPlugin)
    .ready((err) => t.truthy(err))
    .listen()
    .catch((err) => {
      t.truthy(err);
    });
});

function errorPlugin(fastify, opts, next) {
  next(new Error("booom"));
}

function plugin(fastify, opts, next) {
  fastify.decorateReply("test", "test");
  next();
}
