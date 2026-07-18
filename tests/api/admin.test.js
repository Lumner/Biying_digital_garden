import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  onRequestDelete,
  onRequestGet,
  onRequestPost
} from "../../edge-functions/api/admin.js";
import { MemoryKV } from "./mock-kv.js";


function adminRequest(query, token, method = "GET") {
  return new Request(`https://www.biying.site/api/admin${query}`, {
    method,
    headers: { authorization: `Bearer ${token}` }
  });
}

function adminAction(body, options = {}) {
  const headers = {
    "content-type": "application/json",
    ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
    ...(options.cookie ? { cookie: options.cookie } : {}),
    ...(options.origin ? { origin: options.origin } : {})
  };
  return new Request("https://www.biying.site/api/admin", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
}

function cookiePair(response) {
  return String(response.headers.get("set-cookie") || "").split(";")[0];
}


test("admin lists expose independent opaque pagination cursors", async () => {
  const token = "admin-token";
  const kv = new MemoryKV({
    user_alpha: {
      id: "user-a",
      username: "alpha",
      displayName: "Alpha",
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    user_beta: {
      id: "user-b",
      username: "beta",
      displayName: "Beta",
      createdAt: "2026-01-02T00:00:00.000Z"
    },
    private_message_a: {
      id: "a",
      name: "A",
      contact: "a@example.test",
      content: "First",
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    private_message_b: {
      id: "b",
      name: "B",
      contact: "b@example.test",
      content: "Second",
      createdAt: "2026-01-02T00:00:00.000Z"
    },
    guestbook_a: {
      id: "a",
      name: "A",
      content: "First",
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    guestbook_b: {
      id: "b",
      name: "B",
      content: "Second",
      createdAt: "2026-01-02T00:00:00.000Z"
    }
  });
  const env = {
    BIYING_ADMIN_TOKEN: token,
    BIYING_KV: kv
  };

  const first = await onRequestGet({
    request: adminRequest("?limit=1", token),
    env
  });
  assert.equal(first.status, 200);
  const firstPage = await first.json();
  assert.equal(firstPage.users.length, 1);
  assert.equal(firstPage.privateMessages.length, 1);
  assert.equal(firstPage.guestbookMessages.length, 1);
  assert.equal(firstPage.pageInfo.users.complete, false);
  assert.ok(firstPage.pageInfo.users.cursor);
  assert.ok(firstPage.pageInfo.privateMessages.cursor);
  assert.ok(firstPage.pageInfo.guestbookMessages.cursor);

  const query = new URLSearchParams({
    limit: "1",
    usersCursor: firstPage.pageInfo.users.cursor,
    privateMessagesCursor: firstPage.pageInfo.privateMessages.cursor,
    guestbookMessagesCursor: firstPage.pageInfo.guestbookMessages.cursor
  });
  const second = await onRequestGet({
    request: adminRequest(`?${query}`, token),
    env
  });
  assert.equal(second.status, 200);
  const secondPage = await second.json();
  assert.notEqual(secondPage.users[0].username, firstPage.users[0].username);
  assert.notEqual(secondPage.privateMessages[0].id, firstPage.privateMessages[0].id);
  assert.notEqual(secondPage.guestbookMessages[0].id, firstPage.guestbookMessages[0].id);
  assert.equal(secondPage.pageInfo.users.complete, true);
});


test("user deletion scans session pages beyond the former fixed limit", async () => {
  const token = "admin-token";
  const entries = {
    user_target: {
      id: "target-id",
      username: "target",
      displayName: "Target"
    }
  };
  for (let index = 0; index < 200; index += 1) {
    const sessionToken = String(index).padStart(3, "0");
    entries[`session_${sessionToken}`] = {
      token: sessionToken,
      userId: `other-${sessionToken}`,
      username: `other-${sessionToken}`
    };
  }
  entries.session_zzzz = {
    token: "zzzz",
    userId: "target-id",
    username: "target"
  };

  const kv = new MemoryKV(entries);
  const env = {
    BIYING_ADMIN_TOKEN: token,
    BIYING_KV: kv
  };
  const response = await onRequestDelete({
    request: adminRequest("?kind=user&id=target", token, "DELETE"),
    env,
    clientIp: "203.0.113.50"
  });

  assert.equal(response.status, 200);
  assert.equal(await kv.get("user_target"), null);
  assert.equal(await kv.get("session_zzzz"), null);
});


test("admin token exchanges for a secure short-lived HttpOnly session", async () => {
  const token = "admin-token";
  const kv = new MemoryKV();
  const env = {
    BIYING_ADMIN_TOKEN: token,
    BIYING_KV: kv
  };
  const created = await onRequestPost({
    request: adminAction({ action: "create_session" }, {
      token,
      origin: "https://www.biying.site"
    }),
    env,
    clientIp: "203.0.113.60"
  });

  assert.equal(created.status, 200);
  const cookie = created.headers.get("set-cookie") || "";
  assert.match(cookie, /^biying_admin_session=[a-f0-9]{64};/);
  assert.match(cookie, /Path=\/api/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Max-Age=1200/);
  assert.equal(kv.keys("admin_session_").length, 1);

  const dashboard = await onRequestGet({
    request: new Request("https://www.biying.site/api/admin", {
      headers: { cookie: cookiePair(created) }
    }),
    env
  });
  assert.equal(dashboard.status, 200);
});


test("expired admin sessions are rejected and removed", async () => {
  const token = "expired-token";
  const kv = new MemoryKV({
    [`admin_session_${token}`]: {
      token,
      createdAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-01-01T00:20:00.000Z"
    }
  });
  const env = {
    BIYING_ADMIN_AUTH_MODE: "cookie",
    BIYING_ADMIN_TOKEN: "admin-token",
    BIYING_KV: kv
  };
  const response = await onRequestGet({
    request: new Request("https://www.biying.site/api/admin", {
      headers: { cookie: `biying_admin_session=${token}` }
    }),
    env
  });

  assert.equal(response.status, 401);
  assert.equal(await kv.get(`admin_session_${token}`), null);
});


test("admin logout invalidates the session and clears its cookie", async () => {
  const token = "admin-token";
  const kv = new MemoryKV();
  const env = {
    BIYING_ADMIN_AUTH_MODE: "cookie",
    BIYING_ADMIN_TOKEN: token,
    BIYING_KV: kv
  };
  const created = await onRequestPost({
    request: adminAction({ action: "create_session" }, {
      token,
      origin: "https://www.biying.site"
    }),
    env,
    clientIp: "203.0.113.61"
  });
  const cookie = cookiePair(created);
  const loggedOut = await onRequestPost({
    request: adminAction({ action: "logout" }, {
      cookie,
      origin: "https://www.biying.site"
    }),
    env,
    clientIp: "203.0.113.61"
  });

  assert.equal(loggedOut.status, 200);
  assert.match(loggedOut.headers.get("set-cookie") || "", /^biying_admin_session=;/);
  assert.match(loggedOut.headers.get("set-cookie") || "", /Max-Age=0/);
  assert.equal(kv.keys("admin_session_").length, 0);
});


test("cookie-only admin mode rejects direct bearer access but keeps token exchange", async () => {
  const token = "admin-token";
  const kv = new MemoryKV();
  const env = {
    BIYING_ADMIN_AUTH_MODE: "cookie",
    BIYING_ADMIN_TOKEN: token,
    BIYING_KV: kv
  };
  const bearer = await onRequestGet({
    request: adminRequest("", token),
    env
  });
  assert.equal(bearer.status, 401);

  const crossSite = await onRequestPost({
    request: adminAction({ action: "create_session" }, {
      token,
      origin: "https://attacker.example"
    }),
    env,
    clientIp: "203.0.113.62"
  });
  assert.equal(crossSite.status, 403);
  assert.equal(kv.keys("admin_session_").length, 0);

  const exchange = await onRequestPost({
    request: adminAction({ action: "create_session" }, {
      token,
      origin: "https://www.biying.site"
    }),
    env,
    clientIp: "203.0.113.62"
  });
  assert.equal(exchange.status, 200);
});


test("admin dashboard never persists the master token in Web Storage", async () => {
  const source = await readFile(
    new URL("../../docs/assets/javascripts/admin-dashboard.js", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage)\b/);
  assert.match(source, /action:\s*"create_session"/);
  assert.match(source, /action:\s*"logout"/);
});


test("password benchmark is disabled by default and requires an admin cookie", async () => {
  const token = "admin-token";
  const kv = new MemoryKV();
  const env = {
    BIYING_ADMIN_TOKEN: token,
    BIYING_KV: kv,
    BIYING_PASSWORD_BENCHMARK_ENABLED: "1",
    BIYING_PASSWORD_ITERATIONS: "100000"
  };
  const bearerOnly = await onRequestPost({
    request: adminAction({ action: "benchmark_password_hash" }, {
      token,
      origin: "https://www.biying.site"
    }),
    env,
    clientIp: "203.0.113.63"
  });
  assert.equal(bearerOnly.status, 403);

  const created = await onRequestPost({
    request: adminAction({ action: "create_session" }, {
      token,
      origin: "https://www.biying.site"
    }),
    env,
    clientIp: "203.0.113.63"
  });
  const benchmarked = await onRequestPost({
    request: adminAction({ action: "benchmark_password_hash", runs: 3 }, {
      cookie: cookiePair(created),
      origin: "https://www.biying.site"
    }),
    env,
    clientIp: "203.0.113.63"
  });

  assert.equal(benchmarked.status, 200);
  const payload = await benchmarked.json();
  assert.equal(payload.benchmark.iterations, 100000);
  assert.equal(payload.benchmark.runs, 3);
  assert.equal(typeof payload.benchmark.medianMs, "number");
  assert.equal(typeof payload.benchmark.withinTarget, "boolean");

  const disabled = await onRequestPost({
    request: adminAction({ action: "benchmark_password_hash" }, {
      cookie: cookiePair(created),
      origin: "https://www.biying.site"
    }),
    env: {
      ...env,
      BIYING_PASSWORD_BENCHMARK_ENABLED: "0"
    },
    clientIp: "203.0.113.63"
  });
  assert.equal(disabled.status, 403);
});
