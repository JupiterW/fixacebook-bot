# Fixacebook Discord Bot — Design Spec

**Date:** 2026-04-24

## Overview

A Discord bot that detects Facebook Reels links in messages, replies with the equivalent `fixacebook.com` URL for better embeds, and suppresses the original Facebook embed.

## Architecture

Single Node.js process using discord.js v14. Connects to Discord via the Gateway (WebSocket) with the `MESSAGE_CONTENT` privileged intent. On every `messageCreate` event, runs a regex against message content and acts if a Facebook Reels URL is found.

## Components

- `index.js` — Discord client setup, `messageCreate` listener, bot login
- `.env` — `DISCORD_TOKEN` (bot token)
- `package.json` — dependencies: `discord.js`, `dotenv`

## URL Detection

Regex: `https?://(www\.)?facebook\.com\/reels?\/[^\s]+`

Matches:
- `https://www.facebook.com/reel/123456`
- `https://www.facebook.com/reels/123456`

Replacement: swap `facebook.com` → `fixacebook.com` via string replace.

The bot ignores messages from itself to prevent reply loops.

## Bot Behavior

On a Reels URL match, the bot does two things:

1. Calls `message.suppressEmbeds(true)` on the original message — requires `MANAGE_MESSAGES` permission in that channel
2. Replies to the original message with the fixacebook.com URL

Both happen in parallel. If embed suppression fails (missing permission), the reply still goes out — silent failure, not a crash.

## Error Handling

- `suppressEmbeds` wrapped in try/catch to handle missing permissions gracefully
- discord.js handles Gateway reconnection automatically
- Errors logged to console

## Required Bot Permissions

- `Read Messages / View Channels`
- `Send Messages`
- `Manage Messages` (for embed suppression)
- Privileged intent: `MESSAGE CONTENT`

## Testing

Manual: post a Facebook Reels URL in a test channel. Verify the bot replies with the `fixacebook.com` version and the original embed is suppressed.
