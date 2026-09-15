---
title: Fault Tools
description: Reference for ping, delay, hang, disconnect, and malformed_message.
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
