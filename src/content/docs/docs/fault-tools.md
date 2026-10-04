---
title: Fault Tools
description: Reference for health, protocol liveness, delay, cancellation, response, and transport fault tools.
---

## `ping`

Returns a deterministic health payload with `status: "ok"` and a timestamp. Use it for discovery, smoke tests, and observer verification.

## `protocol_ping_liveness`

Sends one server-to-client MCP protocol `ping` while its own tool call is in flight. The existing
`ping` tool checks server health through a client-to-server `tools/call`; protocol ping instead
checks whether the client answers a JSON-RPC request whose method is `ping`.

This feature is currently available in the Failure Lab working tree. Use a local checkout until
a release containing the tool is published.

| Argument            | Required | Range or default                  | Behavior                                            |
| ------------------- | -------- | --------------------------------- | --------------------------------------------------- |
| `pingAfterMs`       | Yes      | Integer, `0`–`30000`              | Wait before sending the protocol ping.              |
| `livenessTimeoutMs` | Yes      | Integer, `1`–`30000`              | Maximum wait for the client's response.             |
| `completionDelayMs` | No       | Integer, `0`–`30000`; default `0` | Additional work delay after a successful ping.      |
| `closeOnFailure`    | No       | Boolean; default `false`          | Close the configured transport after a failed ping. |

```json
{
	"pingAfterMs": 100,
	"livenessTimeoutMs": 1000,
	"completionDelayMs": 100,
	"closeOnFailure": false
}
```

The call waits for `pingAfterMs`, sends one protocol ping, and waits for at most
`livenessTimeoutMs`. A valid response permits the call to continue through `completionDelayMs`
and return successfully. A failed ping returns a tool error when the transport is retained.
Delays and the ping wait use the activating request's cancellation signal; cancellation does
not activate the liveness closure policy. Each invocation has its own waits and sends one ping.

| Ping outcome       | Meaning                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `success`          | The client returned a valid protocol ping result.                               |
| `unsupported`      | The client returned method-not-found, or the negotiated protocol excludes ping. |
| `invalid_response` | The ping failed with another response or request error.                         |
| `timeout`          | No accepted response arrived before the liveness deadline.                      |

With `closeOnFailure: false`, the text result contains the ping and transport outcomes:

```json
{
	"status": "protocol_ping_succeeded",
	"protocolPing": { "outcome": "success" },
	"transport": { "outcome": "retained" }
}
```

A failed ping uses `status: "protocol_ping_failed"` and `isError: true`. With
`closeOnFailure: true`, closure happens before the tool result is returned, so the client may
receive only a connection failure and cannot rely on receiving that diagnostic payload.
The public HTTP entry closes the activating response stream and leaves its listener available.
Stdio retains its shared connection and returns `transport.outcome: "closure_unavailable"` when
closure is requested, protecting unrelated pending calls. Server diagnostics on stderr include
the request ID, ping outcome, and transport outcome. A `closure_requested` diagnostic is recorded
before HTTP closure; `closed` or `close_failed` records the closure operation's outcome.

Protocol ping is supported by MCP `2025-11-25`. MCP `2026-07-28` removed the server-to-client
request channel; this tool reports `unsupported` on that protocol. The included
`protocol-ping-liveness.json` sets `protocolVersion: "2025-11-25"` and can run with
`npm run dev -- run examples/scenarios/protocol-ping-liveness.json`. Scenarios without protocol
selection retain the modern default.

### Check protocol liveness in MCP Inspector

Build Failure Lab in its local repository, then launch Inspector against that build:

```sh
npm run build
npx @modelcontextprotocol/inspector node dist/cli.js serve
```

Connect using legacy MCP `2025-11-25`, open **Tools**, and call `protocol_ping_liveness` with the
arguments above. An answering client should return `protocol_ping_succeeded`; call the `ping`
tool afterward to check server health. Keep `closeOnFailure: false` when inspecting response
diagnostics. Stdio retains the connection even when closure is requested; use HTTP to exercise
request-scoped transport loss. These are manual interoperability steps, not a recorded Inspector
compatibility result.

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

## `response_after_cancellation`

Accepts `{}` and sends one late result for the activating request after the server observes its
cancellation. This tool is available through `serve` over stdio. It is unavailable over HTTP
and through the built-in `run` command, which does not register this stdio-specific controller.

Use an SDK client with an `AbortController` and an `onprogress` callback. Start the call, then
abort when its progress notification arrives. The client call rejects; the server sends a late
response with that same request ID. A following `ping` tool call checks whether the client
remains usable. Client logs or a transport trace are needed to observe how it handles the late
response; Inspector success alone does not establish that behavior.

At most 128 pending or completed activations are tracked. If cancellation is not observed within
five seconds, no late result is sent. Closing the transport clears the controller's timers,
abort listeners, and pending activations; repeated cleanup is safe.

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
