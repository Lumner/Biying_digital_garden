---
title: Privacy Notice
summary: Explains the data handled by site accounts, messages, private contact forms, and anonymous visit statistics.
public: true
avatar_readable: false
tags:
  - privacy
  - site
---

# Privacy Notice

This page explains, in plain language, what this site processes for accounts, messages, private contact forms, and visit statistics. The site owner manages these features; EdgeOne Pages, Functions, and KV provide the hosting and storage infrastructure.

Last updated: July 17, 2026.

## What is collected and stored

### Accounts and sessions

When you create an account, the site stores a username, display name, a password hash with a random salt, the registration time, and the latest password-change time. It does not store a readable plaintext password.

Signing in creates a random session token together with an account identifier, creation time, and expiry time. Session authorization expires after 30 days by default; invalid or expired records are cleaned up when read. One-time recovery codes are stored only as hashes with expiry times and become invalid after successful use.

### Public guestbook messages

A public message stores the account identifier, username, display name, message text, language, creation and update times, and moderation status. The display name, message, and time are publicly visible, so do not include phone numbers, addresses, private email addresses, or other sensitive information.

### Private messages to the site owner

The private form stores the name, contact detail, optional account username, message, language, processing status, and timestamps that you submit. These details are used to reply, assist with account recovery, or handle deletion requests and are not published as guestbook messages.

### Visit statistics

The browser creates a random visitor identifier on this device to distinguish repeat visits. The server stores that identifier, first and most recent visit times, language, and aggregate page-view and visitor totals. The statistics endpoint does not retain the specific page path you visit and is not used for cross-site tracking or advertising profiles.

## Why the data is used

The data is used only to:

- provide account sign-in, recovery, and session management;
- publish, edit, delete, and moderate public guestbook messages;
- receive and process private messages;
- provide the signed-in state required for Biying conversations;
- understand aggregate site use, limit abuse, and diagnose failures.

## Retention

- Accounts and user-managed public messages remain until the user or site owner deletes them.
- Private messages remain until the matter is handled and the site owner removes them; there is currently no automatic deletion period.
- Sessions, recovery codes, and rate-limit records have authorization or operation windows. They stop being valid after expiry and are cleaned when read.
- Anonymous visitor records currently have no automatic deletion period and can be the subject of a deletion request.

## Correction and deletion

Signed-in users can edit or delete their own public messages. To close an account, correct account details, remove a private message, or request removal of a statistics identifier, contact the site owner through the [private form on the account page](register/index.md) and provide enough information to locate the record. Do not place private deletion-request details in the public guestbook.

The random visitor identifier is stored in this browser's `localStorage`. Clearing this site's local data creates a new identifier, but it does not automatically remove an anonymous record already stored on the server.

## Security and limits

The site uses password hashing, random session tokens, one-time recovery codes, an origin allowlist, and request rate limits to reduce risk. No online service can guarantee absolute security, so do not reuse an important password or submit sensitive information to public messages or Biying conversations.
