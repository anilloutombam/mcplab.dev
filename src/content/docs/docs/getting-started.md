---
title: Getting Started
description: Run the MCP Failure Lab demo and your first scenario.
---

MCP Failure Lab requires Node.js 22.19.0 or newer and npm. The fastest path needs no clone or global install:

```sh
npx mcp-failure-lab demo
```

The demo runs a real deterministic 500ms delay through the built-in client, the SDK v2 in-process handler, the `delay` tool, and the assertion pipeline. Scenario execution targets MCP `2026-07-28`.

## Explore the CLI

```sh
npx mcp-failure-lab --help
npx mcp-failure-lab --version
```

## Start the stdio server

```sh
npx mcp-failure-lab serve
```

The process waits silently for a client. Protocol messages use stdout, so operational diagnostics are written to stderr. Press `Ctrl+C` for graceful shutdown.

The stdio server supports MCP `2026-07-28` and retains `2025-11-25` compatibility.

## Run an included scenario

From a repository checkout:

```sh
git clone https://github.com/anilloutombam/mcp-failure-lab.git
cd mcp-failure-lab
npm install
npm run dev -- run examples/scenarios/delay-success.json
```

Next: learn the [scenario format](/docs/scenarios/).
