---
title: Streamable HTTP
description: Run MCP Failure Lab over a local Streamable HTTP endpoint.
---

Start the server with HTTP selected explicitly:

```sh
npx mcp-failure-lab serve --transport http
```

The default endpoint is `http://127.0.0.1:3000/mcp`.

## Configuration

| Option        | Default     | Purpose                   |
| ------------- | ----------- | ------------------------- |
| `--transport` | `stdio`     | Select `stdio` or `http`. |
| `--host`      | `127.0.0.1` | HTTP bind host.           |
| `--port`      | `3000`      | HTTP listener port.       |
| `--path`      | `/mcp`      | Streamable HTTP endpoint. |

HTTP-specific options require `--transport http`. The host, port, and path are validated before the listener starts.

## Protocol behavior

The endpoint serves MCP `2026-07-28` and provides stateless compatibility for `2025-11-25`. Both paths use the same server factory and expose the same `ping`, `delay`, `hang`, and `disconnect` tools.

Calling `disconnect` terminates its active HTTP request instead of returning a normal tool result. The listener remains available for later requests.

## Local security boundary

The default loopback bind is intentional. Failure Lab validates the request path and the `Host` and `Origin` headers. Wildcard bind addresses are rejected because the server does not provide authentication or TLS.

Use a trusted reverse proxy if you need authentication, TLS termination, or access from another machine. Do not expose the endpoint directly to an untrusted network.

## MCP Inspector

Run the HTTP server and Inspector in separate terminals:

```sh
npx mcp-failure-lab serve --transport http
```

```sh
npx @modelcontextprotocol/inspector@latest
```

Add a Streamable HTTP server with URL `http://127.0.0.1:3000/mcp`. If Inspector 2.4 times out while calling tools in Modern mode, use Legacy mode for manual UI checks. Modern `2026-07-28` remains covered through the direct HTTP integration path.

Press `Ctrl+C` in the server terminal for graceful shutdown.
