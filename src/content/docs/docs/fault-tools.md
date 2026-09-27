---
title: Fault Tools
description: Reference for ping, delay, hang, disconnect, malformed_message, duplicate_response, response_after_cancellation, and session_loss.
---

## `ping`

Returns a deterministic health payload with `status: "ok"` and a timestamp. Use it for discovery, smoke tests, and observer verification.

## `delay`

Accepts `delayMs` from `0` through `30000`, waits for that duration, then returns successfully. The implementation is bounded and cancellation-aware.

```json
{ "delayMs": 500 }
```

## `hang`

Intentionally never returns a response. It remains pending until the client cancels, making timeout and cancellation cleanup paths reproducible without leaving server work running.

## `disconnect`

Closes the active MCP transport while its request is in flight. The client receives a connection failure rather than a tool result, exercising transport-loss handling.

:::caution
Over stdio, `disconnect` ends the shared connection, so an observer call cannot succeed afterward.
Over HTTP, it terminates the active request; the listener remains available for later requests.
:::

## `malformed_message`

Returns one response that violates a selected JSON-RPC rule. Available over stdio and Streamable
HTTP, including legacy HTTP SSE responses.

This tool belongs to the built-in Failure Lab server. Running a scenario against an external target
does not inject faults into that target; it must expose the requested tool itself.

| Variant                   | Violation                                                             |
| ------------------------- | --------------------------------------------------------------------- |
| `missing-jsonrpc`         | Omits the required `jsonrpc` member.                                  |
| `invalid-jsonrpc-version` | Uses `"1.0"` instead of `"2.0"`.                                      |
| `result-with-error`       | Includes both `result` and `error`, which must be mutually exclusive. |

```json
{ "variant": "missing-jsonrpc" }
```

Each invocation affects only its own response, matched by request ID. The fault is consumed once;
later calls remain unaffected. At most 128 activations can be pending. Stdio cleanup clears pending
faults, and HTTP fault state is scoped to each request. SSE event buffering is limited to 1,048,576
characters; exceeding that limit fails the response stream.

These responses contain valid JSON but invalid JSON-RPC. This is not random fuzzing or malformed
JSON syntax injection.

### Run from the CLI

Save this as `malformed-message.json`:

```json
{
	"name": "missing JSON-RPC version is rejected",
	"call": {
		"tool": "malformed_message",
		"args": { "variant": "missing-jsonrpc" }
	},
	"timeoutMs": 1000,
	"expect": { "outcome": "error" },
	"observe": {
		"call": { "tool": "ping", "args": {} },
		"timeoutMs": 1000,
		"expect": { "outcome": "success" }
	}
}
```

```sh
npx mcp-failure-lab run malformed-message.json
```

The built-in client reports `Outcome: error`; the observer and assertions should pass. From a
repository checkout, the same scenario is included:

```sh
npm run dev -- run examples/scenarios/malformed-message.json
```

### Check in MCP Inspector

```sh
npx @modelcontextprotocol/inspector npx mcp-failure-lab serve
```

Connect, open **Tools**, select `malformed_message`, and run it with one of the variants above.
Inspector may report a protocol error or wait until its request timeout. Then run `ping`: it should
succeed. Repeat with the other variants to check how the client handles each violation.

## `duplicate_response`

Sends the same JSON-RPC tool result twice with the same request ID. The first response can resolve
the call; the second tests whether the client safely handles an already-settled response.

```json
{}
```

Each invocation adds exactly one duplicate to its own response. At most 128 activations can be
pending. Stdio sends both responses directly. Streamable HTTP returns two SSE message events,
including on the legacy HTTP path. Pending stdio activations are cleared when the transport closes;
HTTP state is scoped to the request.

Clients may ignore the second response, report a protocol error, or close the connection. Run
`ping` afterward to verify whether later requests still work.

### Run from the CLI

```sh
npm run dev -- run examples/scenarios/duplicate-response.json
```

The included scenario expects the tool call and following `ping` observer to succeed with the MCP
TypeScript client.

### Check in MCP Inspector

```sh
npx @modelcontextprotocol/inspector npx mcp-failure-lab serve
```

Connect, open **Tools**, select `duplicate_response`, and call it with `{}`. Note whether Inspector
returns the first result, reports the duplicate, or closes the connection. Then run `ping`.

## `session_loss`

Invalidates the legacy Streamable HTTP session that called the tool. It accepts one activation
mode:

```json
{ "activation": "during_request" }
```

| Activation       | Result                                                                   |
| ---------------- | ------------------------------------------------------------------------ |
| `during_request` | Ends the active call without returning a tool result.                    |
| `after_response` | Returns the activation result, then rejects later calls on that session. |

After either activation, another request using the lost session receives `Session not found`.
Sessions opened by other clients remain usable. At most 128 legacy HTTP sessions are held at once;
sessions without an active request are reclaimed after five minutes of inactivity. Client session
termination and server shutdown also release their state.

The tool is available only after a legacy `2025-11-25` Streamable HTTP initialization. Modern
`2026-07-28` HTTP is per-request, and stdio has one shared connection rather than independent
sessions. Stateless legacy requests also do not expose this tool.

### Check in MCP Inspector

Start the HTTP server:

```sh
npx mcp-failure-lab serve --transport http
```

Connect Inspector to `http://127.0.0.1:3000/mcp` in Legacy mode. Call `session_loss` with
`after_response`, then call `ping` on the same connection. The activation call returns, while
`ping` fails with `Session not found`. Reconnect Inspector to create a new session.

Use `during_request` to test loss while a request is active. That call fails without a tool result;
a separate legacy client session remains connected.
