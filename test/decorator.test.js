import test from "ava";
import { revaneFastify } from "../src/RevaneFastify.js";
import { UserController } from "../testdata/UserController.js";
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
    return [];
  },
  getByMetadata() {
    return [];
  },
};

test("get", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/user`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "hello world");
  instance.close();
});

test("should be able call @All handler with GET", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/something`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "hello world");
  instance.close();
});

test("should be able call @All handler with POST", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/something`, {
    method: "POST",
  });
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "hello world");
  instance.close();
});

test("should pass cookie value to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/something`, {
    headers: { cookie: "test=hello world; Path=/; HttpOnly" },
  });
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "hello world");
  instance.close();
});

test("should pass request to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/uri`);
  const data = await response.text();
  t.is(response.status, 200);
  t.true(data.toString().startsWith("/uriGEThttplocalhost"));
  instance.close();
});

test("should pass cookie values to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/cookies`, {
    headers: { cookie: "test=hello world; Path=/; HttpOnly" },
  });
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "true");
  instance.close();
});

test("should pass header value to handler with alternate name", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/header`, {
    headers: { "x-test": "test" },
  });
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "test");
  instance.close();
});

test("should pass header values to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/headers`, {
    headers: { "x-test": "test" },
  });
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "true");
  instance.close();
});

test("should pass multiple parameters to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/users/de?ids=1,2`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "de1,2");
  instance.close();
});

test("should pass param value to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/user/42`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "42");
  instance.close();
});

test("should pass param values to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/user2/42`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "true");
  instance.close();
});

test("should pass logger to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/log`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "true");
  instance.close();
});

test("should pass query parameters to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/queryParameters`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "true");
  instance.close();
});

test("should pass request body to handler", async (t) => {
  t.plan(2);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance.register("userController").listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/requestpost`, {
    method: "POST",
    body: JSON.stringify({ test: "hello world" }),
    headers: { "content-type": "application/json" },
  });
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "true");
  instance.close();
});

test("get with reply and status", async (t) => {
  t.plan(3);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance
    .register("userController")
    .ready(() => {
      t.truthy(instance.printRoutes());
    })
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/error`);
  const data = await response.text();
  t.is(response.status, 500);
  t.is(data.toString(), "booom");
  instance.close();
});

test("redirect", async (t) => {
  t.plan(3);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance
    .register("userController")
    .ready(() => {
      t.truthy(instance.printRoutes());
    })
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/gone`);
  const data = await response.text();
  t.is(response.status, 500);
  t.is(data.toString(), "booom");
  instance.close();
});

test("request & response", async (t) => {
  t.plan(3);

  const options = {
    port: 0,
  };
  const instance = revaneFastify(options, beanProvider);
  await instance
    .register("userController")
    .ready(() => {
      t.truthy(instance.printRoutes());
    })
    .listen();
  instance.unref();
  const port = instance.port();
  const response = await fetch(`http://localhost:${port}/hello`);
  const data = await response.text();
  t.is(response.status, 200);
  t.is(data.toString(), "200localhost");
  instance.close();
});
