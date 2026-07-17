import assert from "node:assert/strict";
import test from "node:test";

import {
  onRequestDelete,
  onRequestGet
} from "../../edge-functions/api/admin.js";
import { MemoryKV } from "./mock-kv.js";


function adminRequest(query, token, method = "GET") {
  return new Request(`https://www.biying.site/api/admin${query}`, {
    method,
    headers: { authorization: `Bearer ${token}` }
  });
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
