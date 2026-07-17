import assert from "node:assert/strict";
import test from "node:test";

import { onRequestPost as onAuthPost } from "../../edge-functions/api/auth.js";
import { onRequestPost as onMessagePost } from "../../edge-functions/api/messages.js";
import { onRequestPost as onPrivateMessagePost } from "../../edge-functions/api/private-messages.js";
import { MemoryKV } from "./mock-kv.js";


function jsonRequest(url, body, options = {}) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    },
    body: JSON.stringify(body)
  });
}


test("public guestbook writes are limited and do not retain an IP hint", async () => {
  const kv = new MemoryKV();
  const env = { BIYING_KV: kv };
  const registered = await onAuthPost({
    request: jsonRequest("https://www.biying.site/api/auth", {
      username: "guestbook_user",
      password: "a secure password"
    }),
    env,
    clientIp: "203.0.113.40"
  });
  const account = await registered.json();
  const request = () => jsonRequest(
    "https://www.biying.site/api/messages",
    { content: "Hello from the test", locale: "en" },
    { headers: { authorization: `Bearer ${account.token}` } }
  );

  const first = await onMessagePost({
    request: request(),
    env,
    clientIp: "203.0.113.41"
  });
  assert.equal(first.status, 201);

  const second = await onMessagePost({
    request: request(),
    env,
    clientIp: "203.0.113.41"
  });
  assert.equal(second.status, 429);

  const stored = JSON.parse(await kv.get(kv.keys("guestbook_")[0]));
  assert.equal("ipHint" in stored, false);
});


test("private message writes are rate limited by client address", async () => {
  const kv = new MemoryKV();
  const env = { BIYING_KV: kv };
  let response;
  for (let index = 0; index < 4; index += 1) {
    response = await onPrivateMessagePost({
      request: jsonRequest("https://www.biying.site/api/private-messages", {
        name: "Reader",
        contact: "reader@example.test",
        content: `Private message ${index}`,
        locale: "en"
      }),
      env,
      clientIp: "203.0.113.42"
    });
  }

  assert.equal(response.status, 429);
  assert.equal(kv.keys("private_message_").length, 3);
});
