import assert from "node:assert/strict";
import test from "node:test";

import {
  onRequestGet,
  onRequestPost
} from "../../edge-functions/api/stats.js";
import { MemoryKV } from "./mock-kv.js";


function postRequest(body) {
  return new Request("https://www.biying.site/api/stats", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}


test("stats remain available with zero values when KV is not configured", async () => {
  const response = await onRequestGet({ env: {} });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    available: false,
    pageViews: 0,
    totalVisitors: 0,
    updatedAt: ""
  });
});


test("stats reject requests without a usable visitor id", async () => {
  const response = await onRequestPost({
    request: postRequest({ visitorId: "<>" }),
    env: { BIYING_KV: new MemoryKV() }
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "visitor_id_required");

  const partiallyInvalid = await onRequestPost({
    request: postRequest({ visitorId: "visitor valid!" }),
    env: { BIYING_KV: new MemoryKV() }
  });
  assert.equal(partiallyInvalid.status, 400);
});


test("stats count page views while deduplicating known visitors", async () => {
  const kv = new MemoryKV();
  const env = { BIYING_KV: kv };
  const first = await onRequestPost({
    request: postRequest({
      visitorId: "visitor-1",
      path: "/zh/",
      locale: "zh"
    }),
    env
  });
  assert.equal(first.status, 200);
  assert.equal((await first.json()).pageViews, 1);

  const second = await onRequestPost({
    request: postRequest({
      visitorId: "visitor-1",
      path: "/zh/notes/",
      locale: "zh"
    }),
    env
  });
  assert.equal(second.status, 200);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(await second.json()).filter(([key]) => key !== "updatedAt")
    ),
    {
      available: true,
      pageViews: 2,
      totalVisitors: 1
    }
  );

  const visitor = JSON.parse(await kv.get("site_visitor_visitor-1"));
  assert.equal(visitor.locale, "zh");
  assert.equal("lastPath" in visitor, false);
});


test("statistics can be switched to read-only mode without creating records", async () => {
  const kv = new MemoryKV();
  const response = await onRequestPost({
    request: postRequest({
      visitorId: "visitor-readonly",
      path: "/private-path/",
      locale: "en"
    }),
    env: {
      BIYING_KV: kv,
      BIYING_STATS_WRITE_ENABLED: "0"
    },
    clientIp: "203.0.113.30"
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    available: true,
    pageViews: 0,
    totalVisitors: 0,
    updatedAt: ""
  });
  assert.equal(kv.keys().length, 0);
});


test("statistics writes are rate limited", async () => {
  const kv = new MemoryKV();
  const env = { BIYING_KV: kv };
  let response;
  for (let index = 0; index < 31; index += 1) {
    response = await onRequestPost({
      request: postRequest({
        visitorId: "visitor-rate",
        locale: "zh"
      }),
      env,
      clientIp: "203.0.113.31"
    });
  }

  assert.equal(response.status, 429);
  assert.equal((await response.json()).error, "too_frequent");
  assert.ok(Number(response.headers.get("retry-after")) >= 1);
});
