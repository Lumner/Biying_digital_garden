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
  assert.equal(visitor.lastPath, "/zh/notes/");
});
