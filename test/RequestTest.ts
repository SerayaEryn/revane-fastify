import test from "ava";
import { RevaneFastifyRequest } from "../src/RevaneFastifyRequest.js";

test("should return values", (t) => {
  const req = {
    headers: { test: 42 },
    query: { test: "hallo" },
    cookies: { test: "hallo1" },
    params: { test: "hallo2" },
    ip: "1.1.1.1",
    ips: ["1.1.1.1", "2.2.2.2"],
    id: "1",
    host: "Host",
    port: 1243,
    originalUrl: "/",
  } as any;
  const request = new RevaneFastifyRequest(req);
  t.deepEqual(request.headers(), { test: 42 });
  t.deepEqual(request.query(), { test: "hallo" });
  t.deepEqual(request.cookies(), { test: "hallo1" });
  t.deepEqual(request.params(), { test: "hallo2" });
  t.is(request.ip(), "1.1.1.1");
  t.deepEqual(request.ips, ["1.1.1.1", "2.2.2.2"]);
  t.is(request.id, "1");
  t.is(request.host, "Host");
  t.is(request.port, 1243);
  t.is(request.originalUrl, "/");
});
