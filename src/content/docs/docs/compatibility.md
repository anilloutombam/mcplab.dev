---
title: External compatibility
description: Black-box compatibility results for MCP Failure Lab releases and independent MCP clients.
---

MCP Failure Lab 0.9.0 was tested as a black box through its published npm package and exact Git
tag. The run used independent official MCP clients over stdio and Streamable HTTP, including
deliberate timeouts, cancellation, malformed replies, transport loss, and recovery calls.

:::note[Version-specific evidence]
These results apply to the exact versions listed below. A later client release can change its
failure handling without a change to MCP Failure Lab.
:::

## Tested versions

| Component               | Version | Protocol exercised                                |
| ----------------------- | ------: | ------------------------------------------------- |
| MCP Failure Lab         |   0.9.0 | `2026-07-28`; accepts `2025-11-25` initialization |
| Official TypeScript SDK |  1.30.0 | `2025-11-25`                                      |
| Official Python SDK     |   2.2.0 | `2026-07-28`                                      |
| Official Go SDK         |   1.7.0 | `2026-07-28`                                      |
| MCP Inspector CLI       |   2.7.0 | `2025-11-25` and `2026-07-28`                     |

The repository baseline passed all 207 tests across 30 files, and the tag build matched the npm
artifact in every repeated check.

## Compatibility summary

| Behavior                                         | TypeScript |   Python |                 Go |                                    Inspector |
| ------------------------------------------------ | ---------: | -------: | -----------------: | -------------------------------------------: |
| Initialize, call `ping`, and list tools          |       Pass |     Pass |               Pass |                                         Pass |
| Bounded delay                                    |       Pass |     Pass |               Pass |                                         Pass |
| Delay/hang timeout and later recovery            |       Pass |     Pass |               Pass |         One-shot CLI has no per-call timeout |
| Detect missing/invalid `jsonrpc` and recover     |       Pass |     Pass | **Session closes** | Detected; required an external process bound |
| Detect result-with-error and recover             |       Pass |     Pass |               Pass |                      Not separately repeated |
| Observe an injected disconnect                   |       Pass |     Pass |               Pass |            Not automated in the one-shot CLI |
| Recover on the same HTTP client after disconnect |       Pass | **Fail** |               Pass |              Unsupported by the one-shot CLI |

## Python HTTP disconnect result

After the server deliberately interrupted one HTTP response, TypeScript failed that request and
successfully completed the next `ping`. Python `mcp` 2.2.0 instead marked its client connection
closed, rejected the next call, and raised an `ExceptionGroup` during cleanup.

The server stayed available throughout, and no MCP Failure Lab defect was found. The Python-client
behavior is tracked in
[modelcontextprotocol/python-sdk#3522](https://github.com/modelcontextprotocol/python-sdk/issues/3522).

## Go malformed-response result

Go SDK 1.7.0 passed normal calls, delay and hang cancellation, recovery, and an HTTP disconnect
followed by a successful call on the same client. For responses missing `jsonrpc` or declaring
`jsonrpc: "1.0"`, it reported the invalid version and then closed the session. A fresh session
connected normally, and the result-with-error variant did not prevent recovery.

Protocol-level HTTP ping is not included as a failure. The Go client negotiated `2026-07-28`,
whose schema no longer includes that method. The existing report
[modelcontextprotocol/go-sdk#1249](https://github.com/modelcontextprotocol/go-sdk/issues/1249)
was closed on that basis. The Failure Lab `ping` tool passed over both transports.

For the full matrix, release identity, interpretation, and exact reproducer, read the
[versioned 0.9.0 report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/v0.9.0.md).

## What the result means

- MCP Failure Lab 0.9.0 interoperated with both protocol eras tested.
- Fault responses remained request-scoped: clients that kept their transport usable completed a
  normal request after delay, hang, and malformed-response tests.
- A stdio disconnect terminates the server process, so recovery requires a new process and client.
- Client error wording differs. A timeout can still be a valid observation of a deliberately
  malformed response when the following recovery request succeeds.

Compatibility reports supplement the project test suite. They are not a promise that untested
client versions or host applications will behave the same way.
