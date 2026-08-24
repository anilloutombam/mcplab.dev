---
title: Reporting
description: Console and JSON output from scenario execution.
---

The console reporter shows the scenario name, observed outcome, duration, assertion status, and failures. The JSON reporter emits a stable machine-readable structure.

```json
{
  "name": "bounded delay succeeds",
  "outcome": "success",
  "durationMs": 251.25,
  "passed": true,
  "failures": []
}
```

When an observer is configured, the report includes a separate `observer` object with its outcome, duration, pass state, failures, returned result, or execution error.

```sh
npm run dev -- run examples/scenarios/delay-observe-ping.json --report json
```

Input and execution failures also produce JSON when JSON reporting is selected. Reporters return formatted output to the command layer; they do not write to stdout themselves.

:::note
JUnit output is planned, not implemented.
:::
