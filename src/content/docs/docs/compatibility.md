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
