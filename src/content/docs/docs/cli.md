---
title: CLI
description: Commands, reporting flags, and exit codes.
---

## `demo`

```sh
npx mcp-failure-lab demo
```

Runs the built-in deterministic delay scenario through the real execution path.

## `serve`

```sh
npx mcp-failure-lab serve
```

Starts the MCP server over stdio and waits for a client.

## `run`

```sh
npm run dev -- run examples/scenarios/delay-success.json
npm run dev -- run examples/scenarios/delay-success.json --report json
```

The current `run` command uses the built-in Failure Lab server. It does not orchestrate an external MCP host.

## Reporting

Console is the default. Pass `--report json` for machine-readable scenario results and command errors.

## Exit codes

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| `0`  | All expectations passed                         |
| `2`  | Scenario ran, but one or more assertions failed |
| `1`  | Scenario could not be loaded or executed        |

JSON command error codes are `invalid_arguments`, `scenario_load_failed`, and `scenario_execution_failed`.
