import assert from "node:assert/strict";
import test from "node:test";

import {
  onRequestDelete,
  onRequestGet,
  onRequestPost
} from "../../edge-functions/api/auth.js";
import { onRequestPost as onAdminPost } from "../../edge-functions/api/admin.js";
import { MemoryKV } from "./mock-kv.js";


function request(body, options = {}) {
  return new Request("https://www.biying.site/api/auth", {
    method: options.method || "POST",
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

function adminRequest(body, token) {
  return new Request("https://www.biying.site/api/admin", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function sessionCookie(response) {
  const header = response.headers.get("set-cookie") || "";
  const pair = header.split(";")[0];
  return { header, pair };
}


test("registration creates a user session that can be read and logged out", async () => {
  const kv = new MemoryKV();
  const env = { BIYING_KV: kv };
  const registered = await onRequestPost({
    request: request({
      username: "Test_User",
      password: "correct horse battery staple"
    }),
    env,
    clientIp: "203.0.113.10"
  });

  assert.equal(registered.status, 201);
  const registration = await registered.json();
  assert.equal(registration.ok, true);
  assert.equal(registration.user.username, "test_user");
  assert.match(registration.token, /^[a-f0-9]{64}$/);
  assert.equal(kv.keys("user_").length, 1);
  assert.equal(kv.keys("session_").length, 1);
  const storedUser = JSON.parse(await kv.get("user_test_user"));
  assert.equal(storedUser.passwordAlgorithm, "pbkdf2-sha256");
  assert.equal(storedUser.passwordIterations, 100000);
  assert.equal(storedUser.passwordVersion, 2);

  const authorization = `Bearer ${registration.token}`;
  const current = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { authorization }
    }),
    env
  });
  assert.equal(current.status, 200);
  assert.equal((await current.json()).user.username, "test_user");

  const loggedOut = await onRequestDelete({
    request: request(undefined, {
      method: "DELETE",
      headers: { authorization }
    }),
    env
  });
  assert.equal(loggedOut.status, 200);
  assert.equal(kv.keys("session_").length, 0);

  const afterLogout = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { authorization }
    }),
    env
  });
  assert.equal(afterLogout.status, 401);
});


test("login accepts the correct password and rejects incorrect credentials", async () => {
  const kv = new MemoryKV();
  const env = { BIYING_KV: kv };
  await onRequestPost({
    request: request({
      username: "reader",
      password: "a secure password"
    }),
    env,
    clientIp: "203.0.113.11"
  });

  const incorrect = await onRequestPost({
    request: request({
      action: "login",
      username: "reader",
      password: "not the password"
    }),
    env,
    clientIp: "203.0.113.12"
  });
  assert.equal(incorrect.status, 401);
  assert.equal((await incorrect.json()).error, "invalid_credentials");

  const correct = await onRequestPost({
    request: request({
      action: "login",
      username: "reader",
      password: "a secure password"
    }),
    env,
    clientIp: "203.0.113.13"
  });
  assert.equal(correct.status, 200);
  const payload = await correct.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.user.username, "reader");
  assert.match(payload.token, /^[a-f0-9]{64}$/);
});


test("legacy password records login and upgrade lazily without a bulk reset", async () => {
  const kv = new MemoryKV();
  const password = "legacy secure password";
  await onRequestPost({
    request: request({
      username: "legacy_hash",
      password
    }),
    env: { BIYING_KV: kv },
    clientIp: "203.0.113.70"
  });

  const legacy = JSON.parse(await kv.get("user_legacy_hash"));
  const oldSalt = legacy.salt;
  const oldHash = legacy.passwordHash;
  delete legacy.passwordAlgorithm;
  delete legacy.passwordIterations;
  delete legacy.passwordVersion;
  await kv.put("user_legacy_hash", JSON.stringify(legacy));

  const login = await onRequestPost({
    request: request({
      action: "login",
      username: "legacy_hash",
      password
    }),
    env: {
      BIYING_KV: kv,
      BIYING_PASSWORD_ITERATIONS: "120000"
    },
    clientIp: "203.0.113.71"
  });
  assert.equal(login.status, 200);

  const upgraded = JSON.parse(await kv.get("user_legacy_hash"));
  assert.equal(upgraded.passwordAlgorithm, "pbkdf2-sha256");
  assert.equal(upgraded.passwordIterations, 120000);
  assert.equal(upgraded.passwordVersion, 2);
  assert.notEqual(upgraded.salt, oldSalt);
  assert.notEqual(upgraded.passwordHash, oldHash);
  assert.match(upgraded.passwordRehashedAt, /^\d{4}-\d{2}-\d{2}T/);

  const secondLogin = await onRequestPost({
    request: request({
      action: "login",
      username: "legacy_hash",
      password
    }),
    env: {
      BIYING_KV: kv,
      BIYING_PASSWORD_ITERATIONS: "120000"
    },
    clientIp: "203.0.113.72"
  });
  assert.equal(secondLogin.status, 200);
});


test("unknown users and legacy wrong passwords perform equivalent PBKDF2 work", async () => {
  const kv = new MemoryKV();
  const password = "legacy secure password";
  await onRequestPost({
    request: request({
      username: "known_hash",
      password
    }),
    env: { BIYING_KV: kv },
    clientIp: "203.0.113.73"
  });
  const legacy = JSON.parse(await kv.get("user_known_hash"));
  delete legacy.passwordAlgorithm;
  delete legacy.passwordIterations;
  delete legacy.passwordVersion;
  await kv.put("user_known_hash", JSON.stringify(legacy));

  const iterations = [];
  const originalDeriveBits = crypto.subtle.deriveBits;
  crypto.subtle.deriveBits = async function (algorithm, ...args) {
    iterations.push(Number(algorithm.iterations));
    return Reflect.apply(originalDeriveBits, this, [algorithm, ...args]);
  };

  try {
    const env = {
      BIYING_KV: kv,
      BIYING_PASSWORD_ITERATIONS: "120000"
    };
    const missing = await onRequestPost({
      request: request({
        action: "login",
        username: "missing_hash",
        password: "wrong password"
      }),
      env,
      clientIp: "203.0.113.74"
    });
    assert.equal(missing.status, 401);
    const missingWork = iterations.splice(0);

    const incorrect = await onRequestPost({
      request: request({
        action: "login",
        username: "known_hash",
        password: "wrong password"
      }),
      env,
      clientIp: "203.0.113.75"
    });
    assert.equal(incorrect.status, 401);
    const incorrectWork = iterations.splice(0);

    assert.deepEqual(missingWork, [120000]);
    assert.deepEqual(incorrectWork, [100000, 20000]);
    assert.equal(
      missingWork.reduce((total, value) => total + value, 0),
      incorrectWork.reduce((total, value) => total + value, 0)
    );
  } finally {
    crypto.subtle.deriveBits = originalDeriveBits;
  }
});


test("registration validates usernames and passwords without writing users", async () => {
  const kv = new MemoryKV();
  const env = { BIYING_KV: kv };
  const invalid = await onRequestPost({
    request: request({
      username: "<x>",
      password: "short"
    }),
    env,
    clientIp: "203.0.113.14"
  });

  assert.equal(invalid.status, 400);
  assert.equal(kv.keys("user_").length, 0);
  assert.equal(kv.keys("session_").length, 0);
});


test("one-time recovery codes invalidate older sessions and cannot be reused", async () => {
  const kv = new MemoryKV();
  const adminToken = "admin-only-token";
  const env = {
    BIYING_ADMIN_TOKEN: adminToken,
    BIYING_KV: kv
  };
  const registered = await onRequestPost({
    request: request({
      username: "recover_me",
      password: "original password"
    }),
    env,
    clientIp: "203.0.113.20"
  });
  const registration = await registered.json();

  const adminFallback = await onRequestPost({
    request: request({
      action: "reset_password",
      username: "recover_me",
      password: "changed password",
      recoveryToken: adminToken
    }),
    env,
    clientIp: "203.0.113.21"
  });
  assert.equal(adminFallback.status, 503);
  assert.equal((await adminFallback.json()).error, "recovery_not_configured");

  const issued = await onAdminPost({
    request: adminRequest({
      action: "issue_recovery_code",
      username: "recover_me",
      minutes: 30
    }, adminToken),
    env,
    clientIp: "203.0.113.22"
  });
  assert.equal(issued.status, 200);
  const recovery = await issued.json();
  assert.match(recovery.code, /^[A-Z2-9]{8}$/);

  const reset = await onRequestPost({
    request: request({
      action: "reset_password",
      username: "recover_me",
      password: "changed password",
      recoveryToken: recovery.code
    }),
    env,
    clientIp: "203.0.113.23"
  });
  assert.equal(reset.status, 200);
  const resetPayload = await reset.json();

  const oldSession = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { authorization: `Bearer ${registration.token}` }
    }),
    env
  });
  assert.equal(oldSession.status, 401);

  const newSession = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { authorization: `Bearer ${resetPayload.token}` }
    }),
    env
  });
  assert.equal(newSession.status, 200);
  assert.equal((await newSession.json()).user.username, "recover_me");

  const reused = await onRequestPost({
    request: request({
      action: "reset_password",
      username: "recover_me",
      password: "another password",
      recoveryToken: recovery.code
    }),
    env,
    clientIp: "203.0.113.24"
  });
  assert.equal(reused.status, 503);
  assert.equal(await kv.get("recovery_recover_me"), null);

  const user = JSON.parse(await kv.get("user_recover_me"));
  assert.equal(user.sessionVersion, 1);
  assert.equal(user.passwordAlgorithm, "pbkdf2-sha256");
  assert.equal(user.passwordIterations, 100000);
  assert.equal(user.passwordVersion, 2);
});


test("the dedicated recovery token remains an explicit emergency fallback", async () => {
  const kv = new MemoryKV();
  const env = {
    BIYING_KV: kv,
    BIYING_RECOVERY_TOKEN: "dedicated-recovery-token"
  };
  await onRequestPost({
    request: request({
      username: "fallback_user",
      password: "original password"
    }),
    env,
    clientIp: "203.0.113.25"
  });

  const reset = await onRequestPost({
    request: request({
      action: "reset_password",
      username: "fallback_user",
      password: "changed password",
      recoveryToken: "dedicated-recovery-token"
    }),
    env,
    clientIp: "203.0.113.26"
  });
  assert.equal(reset.status, 200);

  const login = await onRequestPost({
    request: request({
      action: "login",
      username: "fallback_user",
      password: "changed password"
    }),
    env,
    clientIp: "203.0.113.27"
  });
  assert.equal(login.status, 200);
});


test("dual mode creates a secure cookie while preserving bearer clients", async () => {
  const kv = new MemoryKV();
  const env = {
    BIYING_AUTH_MODE: "dual",
    BIYING_KV: kv
  };
  const registered = await onRequestPost({
    request: request({
      username: "dual_reader",
      password: "a secure password"
    }, {
      headers: { origin: "https://www.biying.site" }
    }),
    env,
    clientIp: "203.0.113.30"
  });

  assert.equal(registered.status, 201);
  const payload = await registered.json();
  assert.match(payload.token, /^[a-f0-9]{64}$/);
  const cookie = sessionCookie(registered);
  assert.match(cookie.header, /^biying_session=[a-f0-9]{64};/);
  assert.match(cookie.header, /Path=\//);
  assert.match(cookie.header, /HttpOnly/);
  assert.match(cookie.header, /Secure/);
  assert.match(cookie.header, /SameSite=Lax/);
  assert.match(cookie.header, /Max-Age=2592000/);

  const bearerSession = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { authorization: `Bearer ${payload.token}` }
    }),
    env
  });
  assert.equal(bearerSession.status, 200);

  const cookieSession = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { cookie: cookie.pair }
    }),
    env
  });
  assert.equal(cookieSession.status, 200);
  assert.equal((await cookieSession.json()).user.username, "dual_reader");
});


test("cookie mode rejects bearer-only requests and does not expose a token", async () => {
  const kv = new MemoryKV();
  const env = {
    BIYING_AUTH_MODE: "cookie",
    BIYING_KV: kv
  };
  const registered = await onRequestPost({
    request: request({
      username: "cookie_reader",
      password: "a secure password"
    }, {
      headers: { origin: "https://www.biying.site" }
    }),
    env,
    clientIp: "203.0.113.31"
  });

  assert.equal(registered.status, 201);
  const payload = await registered.json();
  assert.equal("token" in payload, false);
  const cookie = sessionCookie(registered);
  const storedToken = kv.keys("session_")[0].slice("session_".length);

  const missingCookie = await onRequestGet({
    request: request(undefined, { method: "GET" }),
    env
  });
  assert.equal(missingCookie.status, 401);

  const bearerOnly = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { authorization: `Bearer ${storedToken}` }
    }),
    env
  });
  assert.equal(bearerOnly.status, 401);

  const cookieOnly = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { cookie: cookie.pair }
    }),
    env
  });
  assert.equal(cookieOnly.status, 200);
});


test("dual mode migrates a legacy bearer session into a cookie once", async () => {
  const kv = new MemoryKV();
  const bearerEnv = { BIYING_KV: kv };
  const registered = await onRequestPost({
    request: request({
      username: "legacy_reader",
      password: "a secure password"
    }),
    env: bearerEnv,
    clientIp: "203.0.113.32"
  });
  const legacy = await registered.json();
  const dualEnv = {
    BIYING_AUTH_MODE: "dual",
    BIYING_KV: kv
  };

  const migrated = await onRequestPost({
    request: request({
      action: "migrate_session"
    }, {
      headers: {
        authorization: `Bearer ${legacy.token}`,
        origin: "https://www.biying.site"
      }
    }),
    env: dualEnv,
    clientIp: "203.0.113.33"
  });

  assert.equal(migrated.status, 200);
  const payload = await migrated.json();
  assert.equal(payload.migrated, true);
  assert.equal(payload.user.username, "legacy_reader");
  assert.equal("token" in payload, false);
  assert.equal(sessionCookie(migrated).pair, `biying_session=${legacy.token}`);

  const unavailable = await onRequestPost({
    request: request({
      action: "migrate_session"
    }, {
      headers: {
        authorization: `Bearer ${legacy.token}`
      }
    }),
    env: bearerEnv,
    clientIp: "203.0.113.34"
  });
  assert.equal(unavailable.status, 409);
});


test("cookie logout clears the browser cookie and invalidates the KV session", async () => {
  const kv = new MemoryKV();
  const env = {
    BIYING_AUTH_MODE: "cookie",
    BIYING_KV: kv
  };
  const registered = await onRequestPost({
    request: request({
      username: "logout_reader",
      password: "a secure password"
    }, {
      headers: { origin: "https://www.biying.site" }
    }),
    env,
    clientIp: "203.0.113.35"
  });
  const cookie = sessionCookie(registered);

  const loggedOut = await onRequestDelete({
    request: request(undefined, {
      method: "DELETE",
      headers: {
        cookie: cookie.pair,
        origin: "https://www.biying.site"
      }
    }),
    env
  });
  assert.equal(loggedOut.status, 200);
  assert.match(loggedOut.headers.get("set-cookie") || "", /^biying_session=;/);
  assert.match(loggedOut.headers.get("set-cookie") || "", /Max-Age=0/);
  assert.equal(kv.keys("session_").length, 0);

  const afterLogout = await onRequestGet({
    request: request(undefined, {
      method: "GET",
      headers: { cookie: cookie.pair }
    }),
    env
  });
  assert.equal(afterLogout.status, 401);
});


test("cookie-setting auth requests reject cross-site origins", async () => {
  const kv = new MemoryKV();
  const env = {
    BIYING_AUTH_MODE: "dual",
    BIYING_KV: kv
  };
  const rejected = await onRequestPost({
    request: request({
      username: "csrf_reader",
      password: "a secure password"
    }, {
      headers: { origin: "https://attacker.example" }
    }),
    env,
    clientIp: "203.0.113.36"
  });

  assert.equal(rejected.status, 403);
  assert.equal((await rejected.json()).error, "origin_not_allowed");
  assert.equal(kv.keys("user_").length, 0);
});
