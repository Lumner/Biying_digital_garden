import assert from "node:assert/strict";
import test from "node:test";

import {
  cleanText,
  currentSession,
  mutationOriginAllowed,
  rateLimit,
  serverError,
  sessionKey
} from "../../edge-functions/api/_shared.js";
import { onRequestOptions as authOptions } from "../../edge-functions/api/auth.js";
import { MemoryKV } from "./mock-kv.js";


test("expired sessions are rejected and removed", async () => {
  const token = "expired-token";
  const kv = new MemoryKV({
    [sessionKey(token)]: {
      userId: "user-1",
      username: "reader",
      expiresAt: "2000-01-01T00:00:00.000Z"
    }
  });
  const request = new Request("https://www.biying.site/api/auth", {
    headers: { authorization: `Bearer ${token}` }
  });

  assert.equal(await currentSession(request, kv), undefined);
  assert.equal(await kv.get(sessionKey(token)), null);
});

test("legacy users and sessions without a version remain valid", async () => {
  const token = "legacy-token";
  const kv = new MemoryKV({
    user_reader: {
      id: "user-1",
      username: "reader",
      displayName: "Reader"
    },
    [sessionKey(token)]: {
      userId: "user-1",
      username: "reader",
      displayName: "Reader",
      expiresAt: "2099-01-01T00:00:00.000Z"
    }
  });
  const request = new Request("https://www.biying.site/api/auth", {
    headers: { authorization: `Bearer ${token}` }
  });

  const session = await currentSession(request, kv);
  assert.equal(session.username, "reader");
  assert.equal(session.sessionVersion, 0);
});

test("dual mode falls back to a valid bearer when the preferred cookie is stale", async () => {
  const token = "legacy-token";
  const kv = new MemoryKV({
    user_reader: {
      id: "user-1",
      username: "reader",
      displayName: "Reader"
    },
    [sessionKey(token)]: {
      userId: "user-1",
      username: "reader",
      displayName: "Reader",
      expiresAt: "2099-01-01T00:00:00.000Z"
    }
  });
  const request = new Request("https://www.biying.site/api/auth", {
    headers: {
      authorization: `Bearer ${token}`,
      cookie: "biying_session=stale-token"
    }
  });

  const session = await currentSession(request, kv, {
    env: { BIYING_AUTH_MODE: "dual" }
  });
  assert.equal(session.username, "reader");
  assert.equal(session.authSource, "bearer");
});


test("rate limiting allows the configured window and then blocks", async () => {
  const kv = new MemoryKV();
  const options = {
    action: "test",
    identifier: "visitor",
    limit: 2,
    windowMs: 60000
  };

  assert.equal((await rateLimit(kv, options)).limited, false);
  assert.equal((await rateLimit(kv, options)).limited, false);
  const blocked = await rateLimit(kv, options);
  assert.equal(blocked.limited, true);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterMs > 0);
});

test("expired rate-limit records are replaced with a fresh window", async () => {
  const kv = new MemoryKV({
    rate_expired: {
      windowStart: Date.parse("2000-01-01T00:00:00.000Z"),
      count: 99,
      expiresAt: "2000-01-01T00:01:00.000Z"
    }
  });
  const result = await rateLimit(kv, {
    key: "rate_expired",
    limit: 2,
    windowMs: 60000
  });
  assert.equal(result.limited, false);
  assert.equal(result.remaining, 1);
  const stored = JSON.parse(await kv.get("rate_expired"));
  assert.equal(stored.count, 1);
});


test("public errors omit internal exception messages", async () => {
  const response = serverError(new Error("database password leaked"), "safe_failure");
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "safe_failure" });
});


test("public text cleaning removes markup and enforces length", () => {
  const cleaned = cleanText(" <script>alert(1)</script> hello ", 12);
  assert.equal(cleaned.length, 12);
  assert.doesNotMatch(cleaned, /[<>]/);
});


test("CORS reflects only official or explicitly configured origins", () => {
  const preflight = (origin) => new Request("https://www.biying.site/api/auth", {
    method: "OPTIONS",
    headers: {
      "access-control-request-method": "POST",
      origin
    }
  });

  const official = authOptions({
    request: preflight("https://www.biying.site"),
    env: {}
  });
  assert.equal(
    official.headers.get("access-control-allow-origin"),
    "https://www.biying.site"
  );
  assert.equal(official.headers.get("access-control-allow-credentials"), "true");
  assert.match(official.headers.get("vary") || "", /Origin/i);

  const unknown = authOptions({
    request: preflight("https://attacker.example"),
    env: {}
  });
  assert.equal(unknown.headers.get("access-control-allow-origin"), null);
  assert.equal(unknown.headers.get("access-control-allow-credentials"), null);
  assert.match(unknown.headers.get("vary") || "", /Origin/i);

  const local = authOptions({
    request: preflight("http://127.0.0.1:8000"),
    env: { BIYING_ALLOWED_ORIGINS: "http://127.0.0.1:8000" }
  });
  assert.equal(
    local.headers.get("access-control-allow-origin"),
    "http://127.0.0.1:8000"
  );
  assert.equal(local.headers.get("access-control-allow-credentials"), "true");
});


test("mutation origin checks are staged for bearer and mandatory for cookies", () => {
  const mutation = (origin = "") => new Request("https://www.biying.site/api/messages", {
    method: "POST",
    headers: origin ? { origin } : {}
  });

  assert.equal(
    mutationOriginAllowed(mutation(), {}, { authSource: "bearer" }),
    true
  );
  assert.equal(
    mutationOriginAllowed(
      mutation("https://attacker.example"),
      { BIYING_STRICT_ORIGIN_CHECK: "1" },
      { authSource: "bearer" }
    ),
    false
  );
  assert.equal(
    mutationOriginAllowed(
      mutation("https://www.biying.site"),
      { BIYING_STRICT_ORIGIN_CHECK: "1" },
      { authSource: "bearer" }
    ),
    true
  );
  assert.equal(
    mutationOriginAllowed(mutation(), {}, { authSource: "cookie" }),
    false
  );
});
