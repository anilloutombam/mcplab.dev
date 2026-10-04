---
title: Scenarios
description: Define deterministic fault calls and expectations in JSON.
---

A scenario describes one primary tool call, its deadline, and the expected observation.

```json
{
	"name": "bounded delay succeeds",
	"call": { "tool": "delay", "args": { "delayMs": 250 } },
	"timeoutMs": 1000,
	"expect": {
		"outcome": "success",
		"maxDurationMs": 500,
		"result": { "isError": false, "textContains": "\"status\":\"delayed\"" }
	}
}
```

`outcome` is `success`, `error`, or `timeout`. `textContains` is case-sensitive and searches only MCP content items whose type is `text`. If `timeoutMs` is omitted, the CLI applies a 30-second deadline.

## Protocol liveness calls

`protocol_ping_liveness` sends a protocol ping during its own primary tool call. Its arguments
configure activation and a separate liveness deadline; the scenario's `timeoutMs` still bounds
the whole client call. Allow enough time for `pingAfterMs`, `livenessTimeoutMs`, and any
`completionDelayMs`, plus transport overhead.

Set the optional top-level `protocolVersion` to `"2025-11-25"` or `"2026-07-28"` for built-in
execution. Omitting it keeps the modern `2026-07-28` default. Legacy execution uses linked
in-memory MCP transports; modern execution uses the in-process HTTP handler. Protocol selection
applies to both the primary and observer calls. It is rejected with `--target`, where the external
client negotiates its own protocol.

The included `protocol-ping-liveness.json` selects `"2025-11-25"` and passes through the built-in
runner:

```sh
npm run dev -- run examples/scenarios/protocol-ping-liveness.json
```

See [protocol liveness](/docs/fault-tools/#protocol_ping_liveness) for
arguments, result fields, and local Inspector steps.

## Observer verification

Use `observe` to make a separate call after the primary path. The calls are sequential and share the same MCP client connection.

```json
{
	"name": "server remains responsive after a delay",
	"call": { "tool": "delay", "args": { "delayMs": 250 } },
	"timeoutMs": 1000,
	"expect": { "outcome": "success" },
	"observe": {
		"call": { "tool": "ping", "args": {} },
		"timeoutMs": 1000,
		"expect": {
			"outcome": "success",
			"result": { "isError": false, "textContains": "\"status\":\"ok\"" }
		}
	}
}
```

The observer runs even if the primary call errors or times out. An observer timeout, connection failure, or thrown error always fails verification.

For malformed responses, expect a primary `error` and use `ping` as the observer to confirm the fault
did not affect later calls. A protocol error is not a valid tool result with `isError: true`, so do
not add result assertions to that primary call. See the
[malformed-message example](/docs/fault-tools/#run-from-the-cli).

For duplicate responses, expect the primary call to succeed and use `ping` as the observer to
confirm the connection remains usable. The scenario runner records the first tool result; use MCP
Inspector or client diagnostics to verify how a client handles the second response. See the
[duplicate-response example](/docs/fault-tools/#duplicate_response).
