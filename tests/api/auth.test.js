import assert from "node:assert/strict";
import test from "node:test";

import {
  onRequestDelete,
  onRequestGet,
  onRequestPost
} from "../../edge-functions/api/auth.js";
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
