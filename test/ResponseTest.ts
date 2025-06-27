import test from "ava";
import { RevaneFastifyResponse } from "../src/RevaneFastifyResponse.js";

test("should return values", (t) => {
  t.plan(8);
  const reply = {
    headers(values) {
      this.headerValues = values;
    },
    statusCode: 200,
    removeHeader(removedHeader: string) {
      this.removedHeader = removedHeader;
    },
    hasHeader(header: string) {
      return true;
    },
    getHeaders() {
      return { test: 42 };
    },
    setCookie(name, value, options) {
      this.cookie = { name, value, options };
    },
    writeEarlyHints(earlyHints, cb) {
      this.earlyHints = earlyHints;
      cb();
    },
  } as any;
  const response = new RevaneFastifyResponse(reply);
  response.setHeaders({ test: 42 });
  response.removeHeader("hallo");
  response.setCookie("test", "42", { maxAge: 42 });
  response.writeEarlyHints({ value: "1" }, () => {
    t.pass();
  });
  t.deepEqual(reply.headerValues, { test: 42 });
  t.is(reply.statusCode, response.statusCode);
  t.is(reply.removedHeader, "hallo");
  t.true(response.hasHeader("hallo"));
  t.deepEqual(response.headers, { test: 42 });
  t.deepEqual(reply.cookie, {
    name: "test",
    value: "42",
    options: { maxAge: 42 },
  });
  t.deepEqual(reply.earlyHints, { value: "1" });
});
