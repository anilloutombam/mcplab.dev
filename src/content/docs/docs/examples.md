---
title: Examples
description: Included scenarios, observer verification, Inspector, and Future AGI validation.
---

The repository includes four scenario files:

- `delay-success.json` — bounded delay with outcome and duration checks
- `delay-result.json` — MCP result assertions
- `hang-timeout.json` — expected timeout from the hanging tool
- `delay-observe-ping.json` — post-condition verification through `ping`

## Verify with MCP Inspector

```sh
npx @modelcontextprotocol/inspector npx mcp-failure-lab serve
```

Connect with stdio, list tools, select `ping`, and run it. Do not share temporary authentication tokens embedded in Inspector URLs.

## Observer verification

```sh
npm run dev -- run examples/scenarios/delay-observe-ping.json
```

This proves the server is responsive after the primary delay through a separate tool path on the same connection.

## Future AGI experiment

The published `mcp-failure-lab@0.3.2` package was exercised with Future AGI using an independent Python MCP client. The experiment invoked the real `hang` tool over stdio, applied a client-side timeout, and passed the failure into simulated agent conversations. All ten simulation calls completed.

See `examples/integrations/futureagi` in the repository for the adapter, experiment notes, and reproduction steps. This is external validation, not built-in external-client orchestration.
