---
title: Troubleshooting
description: Diagnose common setup, stdio, timeout, and assertion issues.
---

## The command does not start

Confirm Node.js 22.19.0 or newer is active, then check the published CLI:

```sh
node --version
npx mcp-failure-lab --help
```

## `serve` appears silent

That is expected. The stdio server waits for an MCP client and keeps stdout clean for protocol messages. Connect with MCP Inspector or another stdio-capable client.

## A scenario times out unexpectedly

Check the scenario’s `timeoutMs` against the requested delay. When omitted, the CLI uses 30 seconds for each primary or observer call.

## Result text does not match

`textContains` is case-sensitive and inspects only MCP content items with type `text`. It does not search arbitrary serialized result fields.

## The observer failed after disconnect

Observer calls reuse the same MCP client connection. Because `disconnect` closes that transport, the observer cannot verify state afterward.

## JSON output is not valid

Use `--report json`. If you are integrating the stdio server directly, ensure your own diagnostics do not mix with protocol traffic on stdout.

## Exit code `2`

Execution completed, but at least one expectation failed. Exit code `1` instead means the scenario could not be loaded or executed.
