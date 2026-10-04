---
title: Troubleshooting
description: Diagnose common setup, transport, timeout, and assertion issues.
---

## The command does not start

Confirm Node.js 22.19.0 or newer is active, then check the published CLI:

```sh
node --version
npx mcp-failure-lab --help
```

## `serve` appears silent

That is expected. The stdio server waits for an MCP client and keeps stdout clean for protocol messages. Connect with MCP Inspector or another stdio-capable client.

## The HTTP endpoint does not start

Confirm that HTTP was selected explicitly and that the port is available:

```sh
npx mcp-failure-lab serve --transport http
```

The default endpoint is `http://127.0.0.1:3000/mcp`. HTTP-specific host, port, and path options are rejected in stdio mode.

## Inspector tool calls time out in Modern mode

Inspector 2.4 can time out on sessionless Modern Streamable HTTP tool calls. Use Legacy mode for manual Inspector checks. The server's Modern `2026-07-28` path can be verified with a direct SDK client.

## Protocol liveness returns `unsupported`

The `protocol_ping_liveness` tool requires legacy MCP `2025-11-25` for its server-to-client
request. Modern `2026-07-28` excludes protocol ping, and the built-in runner uses that modern
protocol. Use a legacy client to test the successful exchange. Until the feature is released,
launch the local Failure Lab build rather than the published package.

With `closeOnFailure: true`, the client may receive a connection error before the ping diagnosis
can be delivered over HTTP; consult the correlated server stderr diagnostic or use `false` to
inspect the returned diagnosis. Stdio reports `closure_unavailable` and retains the shared
connection. See [Fault Tools](/docs/fault-tools/#protocol_ping_liveness).

## `response_after_cancellation` is not listed

Use the stdio `serve` entry. The tool is not registered for HTTP or the built-in HTTP runner.
See [Fault Tools](/docs/fault-tools/#response_after_cancellation) for the cancellation workflow.

## `session_loss` is not listed

Connect over Streamable HTTP in Inspector's Legacy mode and initialize a session. The tool is not
available over stdio, Modern HTTP, or legacy requests that do not establish a session.

After `session_loss` runs, reconnect before making another call. A request that reuses the lost
session ID receives `Session not found`.

## `disconnect` reports `fetch failed`

That is the expected HTTP fault. `disconnect` terminates the active request before a tool result is returned. The HTTP listener stays running, so a later `ping` from a new request can succeed.

## A scenario times out unexpectedly

For `malformed_message`, a timeout can be expected: some clients ignore an invalid response and
leave the request pending. Other clients reject it immediately. Run `ping` afterward to check that
the connection remains usable. The built-in CLI client reports an `error` for `missing-jsonrpc`.

Check the scenario’s `timeoutMs` against the requested delay. When omitted, the CLI uses 30 seconds for each primary or observer call.

## `duplicate_response` appears to succeed normally

That can be expected. A client may resolve the first response and silently ignore the second. Run
`ping` afterward to check whether the connection remains usable. Use Inspector or client logs when
you need to see whether the duplicate produced a protocol diagnostic.

## Result text does not match

`textContains` is case-sensitive and inspects only MCP content items with type `text`. It does not search arbitrary serialized result fields.

## The observer failed after disconnect

Over stdio, observer calls reuse the connection that `disconnect` closed, so verification fails.
Over HTTP, `disconnect` terminates the active request instead of the listener. If the observer still
fails, check whether the client remains usable after that request failure.

## JSON output is not valid

Use `--report json`. If you are integrating the stdio server directly, ensure your own diagnostics do not mix with protocol traffic on stdout.

## Exit code `2`

Execution completed, but at least one expectation failed. Exit code `1` instead means the scenario could not be loaded or executed.
