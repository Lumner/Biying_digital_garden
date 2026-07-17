import assert from "node:assert/strict";
import test from "node:test";

import {
  cleanText,
  currentSession,
  rateLimit,
  serverError,
  sessionKey
} from "../../edge-functions/api/_shared.js";
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
