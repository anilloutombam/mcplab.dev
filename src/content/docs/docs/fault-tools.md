---
title: Fault Tools
description: Reference for ping, delay, hang, and disconnect.
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
`disconnect` ends the shared connection, so an observer call on that connection cannot succeed afterward.
:::
