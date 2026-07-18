import assert from "node:assert/strict";
import test from "node:test";

import { onRequestPost as onAuthPost } from "../../edge-functions/api/auth.js";
import { onRequestPost as onChatPost } from "../../edge-functions/api/chat.js";
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


test("cookie-authenticated guestbook and chat writes require an allowed origin", async () => {
  const kv = new MemoryKV();
  const env = {
    BIYING_AUTH_MODE: "cookie",
    BIYING_KV: kv
  };
  const registered = await onAuthPost({
    request: jsonRequest(
      "https://www.biying.site/api/auth",
      {
        username: "cookie_writer",
        password: "a secure password"
      },
      { headers: { origin: "https://www.biying.site" } }
    ),
    env,
    clientIp: "203.0.113.43"
  });
  const cookie = (registered.headers.get("set-cookie") || "").split(";")[0];

  const rejectedMessage = await onMessagePost({
    request: jsonRequest(
      "https://www.biying.site/api/messages",
      { content: "Cross-site message", locale: "en" },
      {
        headers: {
          cookie,
          origin: "https://attacker.example"
        }
      }
    ),
    env,
    clientIp: "203.0.113.44"
  });
  assert.equal(rejectedMessage.status, 403);
  assert.equal((await rejectedMessage.json()).error, "origin_not_allowed");

  const rejectedChat = await onChatPost({
    request: jsonRequest(
      "https://www.biying.site/api/chat",
      { message: "Cross-site chat", locale: "en" },
      {
        headers: {
          cookie,
          origin: "https://attacker.example"
        }
      }
    ),
    env,
    clientIp: "203.0.113.45"
  });
  assert.equal(rejectedChat.status, 403);
  assert.equal((await rejectedChat.json()).error, "origin_not_allowed");

  const acceptedMessage = await onMessagePost({
    request: jsonRequest(
      "https://www.biying.site/api/messages",
      { content: "Same-site message", locale: "en" },
      {
        headers: {
          cookie,
          origin: "https://www.biying.site"
        }
      }
    ),
    env,
    clientIp: "203.0.113.46"
  });
  assert.equal(acceptedMessage.status, 201);
});
