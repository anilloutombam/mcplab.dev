---
title: External compatibility
description: Black-box compatibility results for MCP Failure Lab releases and independent MCP clients.
---

Published MCP Failure Lab releases are tested as black boxes with independent official MCP clients
over stdio and Streamable HTTP.

:::note[Version-specific evidence]
These results apply to the exact versions listed below. A later client release can change its
failure handling without a change to MCP Failure Lab.
:::

## Open-source project tests

These tests used the published `mcp-failure-lab@0.10.0` package. They did not use a local Failure
Lab build.

| Project                                                                                                |   Version | Tested paths              | Result                                    |
| ------------------------------------------------------------------------------------------------------ | --------: | ------------------------- | ----------------------------------------- |
| [`sparfenyuk/mcp-proxy`](https://github.com/sparfenyuk/mcp-proxy)                                      |    0.12.0 | stdio ↔ Streamable HTTP   | Two reproducible issues                   |
| [`punkpeye/mcp-proxy`](https://github.com/punkpeye/mcp-proxy)                                          |    6.7.19 | stdio → Streamable HTTP   | Disconnect recovery failed                |
| [Official Everything server](https://github.com/modelcontextprotocol/servers/tree/main/src/everything) | 2026.8.31 | stdio and Streamable HTTP | One stdio cancellation/cleanup limitation |
| [`supercorp-ai/supergateway`](https://github.com/supercorp-ai/supergateway)                            |     4.0.0 | stdio ↔ Streamable HTTP   | No defect found                           |

### `mcp-proxy` 0.12.0

Baseline calls, bounded delay, timeout recovery, malformed-response isolation, and normal cleanup
passed.

Two failures reproduced:

1. A clean install resolved Python MCP SDK 2.2.0 and failed at startup with
   `ImportError: cannot import name 'request_ctx'`. Pinning `mcp>=1.27.1,<2` allowed the tests to
   run.
2. A transport disconnect was not recovered. HTTP-to-stdio mode exited on an unhandled
   `RemoteProtocolError`. In the reverse direction, the proxy stayed up but did not restart the
   exited stdio child.

Upstream tracking:

- [Dependency incompatibility #235](https://github.com/sparfenyuk/mcp-proxy/issues/235)
- [HTTP/SSE reconnection #75](https://github.com/sparfenyuk/mcp-proxy/issues/75)
- [Exited stdio child #247](https://github.com/sparfenyuk/mcp-proxy/issues/247)

[Full `mcp-proxy` report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/mcp-proxy-0.12.0.md)

### `punkpeye/mcp-proxy` 6.7.19

Baseline, delay, timeout recovery, duplicate response, malformed response, and cleanup passed over
stateful Streamable HTTP.

After the stdio child disconnected, current and new sessions failed with `Not connected`. The proxy
stayed running but did not restart the child.

[Full `punkpeye/mcp-proxy` report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/punkpeye-mcp-proxy-6.7.19.md)

### Everything server 2026.8.31

Baseline calls, a bounded long-running operation, input-error recovery, and same-session recovery
after timeout passed over stdio and Streamable HTTP.

After a two-second operation was cancelled at 400 ms, stdio client cleanup did not complete within
the 400 ms cleanup limit. The result reproduced three times. The same HTTP test cleaned up normally.
The published long-running tool waits on timers and does not check cancellation.

[Upstream issue #4846](https://github.com/modelcontextprotocol/servers/issues/4846)

The server has no tools for forced disconnects or malformed responses, so those cases were not run.

[Full Everything server report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/everything-server-2026.8.31.md)

### Supergateway 4.0.0

Both Streamable HTTP/stdio bridge directions passed baseline, delay, timeout recovery, duplicate
response, malformed response, and normal cleanup tests.

For HTTP-to-stdio, a forced upstream disconnect returned an error and the same stdio session passed
the next call. For stdio-to-HTTP, the disconnect removed the affected stateful session; a new
session started a new child and passed.

No Supergateway defect was reproduced.

[Full Supergateway report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/supergateway-4.0.0.md)

## 0.10.0 duplicate-response results

The published `mcp-failure-lab@0.10.0` package was tested with `duplicate_response` followed by a
same-session `ping`. Each client accepted the first result and remained usable over both stdio and
Streamable HTTP.

| Client     | Version | stdio | Streamable HTTP | Observable duplicate behavior          | Recovery |
| ---------- | ------: | ----: | --------------: | -------------------------------------- | -------: |
| TypeScript |  1.30.0 |  Pass |            Pass | Reported a response for an unknown ID  |     Pass |
| Python     |   2.2.0 |  Pass |            Pass | No call-level duplicate error surfaced |     Pass |
| Go         |   1.7.0 |  Pass |            Pass | No call-level duplicate error surfaced |     Pass |
| Rust       |   3.4.0 |  Pass |            Pass | No call-level duplicate error surfaced |     Pass |
| C#         |   2.2.0 |  Pass |            Pass | No call-level duplicate error surfaced |     Pass |

The TypeScript diagnostic was delivered through the SDK error callback after the original request
had completed. It did not close the session. For the other clients, the result describes the public
call path; their private diagnostic handling was not instrumented.

Read the
[versioned 0.10.0 report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/v0.10.0.md)
for the release identity, method, runtime versions, and scope.

## 0.9.0 broader compatibility matrix

MCP Failure Lab 0.9.0 was tested through its published npm package and exact Git tag. The run
covered deliberate timeouts, cancellation, malformed replies, transport loss, and recovery calls.

### Tested versions

| Component               | Version | Protocol exercised                                |
| ----------------------- | ------: | ------------------------------------------------- |
| MCP Failure Lab         |   0.9.0 | `2026-07-28`; accepts `2025-11-25` initialization |
| Official TypeScript SDK |  1.30.0 | `2025-11-25`                                      |
| Official Python SDK     |   2.2.0 | `2026-07-28`                                      |
| Official Go SDK         |   1.7.0 | `2026-07-28`                                      |
| Official Rust SDK       |   3.4.0 | `2026-07-28`                                      |
| Official C# SDK         |   2.2.0 | `2026-07-28`                                      |
| MCP Inspector CLI       |   2.7.0 | `2025-11-25` and `2026-07-28`                     |

The repository baseline passed all 207 tests across 30 files, and the tag build matched the npm
artifact in every repeated check.

### Compatibility summary

| Behavior                                         | TypeScript |   Python |                 Go |                Rust |   C# |                                    Inspector |
| ------------------------------------------------ | ---------: | -------: | -----------------: | ------------------: | ---: | -------------------------------------------: |
| Initialize, call `ping`, and list tools          |       Pass |     Pass |               Pass |                Pass | Pass |                                         Pass |
| Bounded delay                                    |       Pass |     Pass |               Pass |                Pass | Pass |                                         Pass |
| Delay/hang timeout and later recovery            |       Pass |     Pass |               Pass |                Pass | Pass |         One-shot CLI has no per-call timeout |
| Detect missing/invalid `jsonrpc` and recover     |       Pass |     Pass | **Session closes** |                Pass | Pass | Detected; required an external process bound |
| Reject result-with-error and recover             |       Pass |     Pass |               Pass | **Accepted result** | Pass |                      Not separately repeated |
| Observe an injected disconnect                   |       Pass |     Pass |               Pass |                Pass | Pass |            Not automated in the one-shot CLI |
| Recover on the same HTTP client after disconnect |       Pass | **Fail** |               Pass |                Pass | Pass |              Unsupported by the one-shot CLI |

### Python HTTP disconnect result

After the server deliberately interrupted one HTTP response, TypeScript failed that request and
successfully completed the next `ping`. Python `mcp` 2.2.0 instead marked its client connection
closed, rejected the next call, and raised an `ExceptionGroup` during cleanup.

The server stayed available throughout, and no MCP Failure Lab defect was found. The Python-client
behavior is tracked in
[modelcontextprotocol/python-sdk#3522](https://github.com/modelcontextprotocol/python-sdk/issues/3522).

### Go malformed-response result

Go SDK 1.7.0 passed normal calls, delay and hang cancellation, recovery, and an HTTP disconnect
followed by a successful call on the same client. For responses missing `jsonrpc` or declaring
`jsonrpc: "1.0"`, it reported the invalid version and then closed the session. A fresh session
connected normally, and the result-with-error variant did not prevent recovery.

Protocol-level HTTP ping is not included as a failure. The Go client negotiated `2026-07-28`,
whose schema no longer includes that method. The existing report
[modelcontextprotocol/go-sdk#1249](https://github.com/modelcontextprotocol/go-sdk/issues/1249)
was closed on that basis. The Failure Lab `ping` tool passed over both transports.

### Rust and C# results

Rust `rmcp` 3.4.0 and C# `ModelContextProtocol` 2.2.0 passed normal calls, delay and hang
cancellation, request recovery, malformed-version detection, and HTTP disconnect recovery.
C# rejected the response containing both `result` and `error`. Rust instead accepted that
invalid JSON-RPC response as a successful result over both transports, while the following normal
request still succeeded. This is classified as an external Rust SDK validation gap, not a Failure
Lab defect, and is tracked as
[modelcontextprotocol/rust-sdk#1283](https://github.com/modelcontextprotocol/rust-sdk/issues/1283).

For the full matrix, release identity, interpretation, and exact reproducer, read the
[versioned 0.9.0 report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/v0.9.0.md).

## What the results mean

- MCP Failure Lab 0.10.0 produced request-scoped duplicate responses while every tested client
  remained usable for a following call.
- MCP Failure Lab 0.9.0 interoperated with both protocol eras tested.
- Fault responses remained request-scoped: clients that kept their transport usable completed a
  normal request after delay, hang, and malformed-response tests.
- A stdio disconnect terminates the server process, so recovery requires a new process and client.
- Client error wording differs. A timeout can still be a valid observation of a deliberately
  malformed response when the following recovery request succeeds.

Compatibility reports supplement the project test suite. They are not a promise that untested
client versions or host applications will behave the same way.

## Decision-layer experiments

Decision-layer experiments ask how downstream systems act on MCP failure evidence. They are kept
separate from client compatibility results because they do not test protocol conformance.

Read the [Jev 1.13 recovery-evidence experiment](/docs/jev-recovery-experiment/) for a controlled
A/B test showing how successful recovery evidence changed `accept`, `retry`, and `reject`
decisions.
