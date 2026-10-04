---
title: Reporting
description: Console, JSON, and JUnit XML output from scenario execution.
---

The console reporter shows the scenario name, observed outcome, duration, assertion status, and
failures. The JSON reporter emits a stable machine-readable structure.

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

External runs include an `execution` object containing the adapter name, adapter lifecycle status,
and ordered diagnostics for setup, execution, observation, cancellation, and cleanup. Adapter
failures remain separate from the scenario's `failures` array, which contains assertion failures.

## Protocol liveness diagnostics

For `protocol_ping_liveness`, the report's primary `outcome` describes the tool call. When the
tool result arrives, JSON reporting preserves its text content containing `protocolPing.outcome`
(`success`, `unsupported`, `invalid_response`, or `timeout`) and `transport.outcome`. These are
tool payload fields, not additional top-level report fields. A liveness timeout with the transport
retained produces a primary `error` with `isError: true`; it is distinct from the scenario client's
own deadline producing a primary `timeout`.

When closure prevents delivery of the result, the report captures the client-side execution
error, but does not preserve the server's ping classification. Server stderr separately records
JSON events named `protocol_ping_liveness`, correlated by `requestId`, before closure. These events
include `protocolPing.outcome` and `transport.outcome`; they are not embedded in scenario JSON.
Stdio reports `closure_unavailable` in the returned tool payload and preserves its shared connection.
Console output shows the primary
outcome and assertion status; inspect JSON result content for retained-transport diagnostics.
See [Fault Tools](/docs/fault-tools/#protocol_ping_liveness) for the complete behavior.

## JUnit XML

Generate a JUnit report from a repository checkout with:

```sh
npm run --silent dev -- run examples/scenarios/delay-success.json --report junit > junit.xml
```

`--silent` prevents npm's command banner from being written before the XML declaration. The report
is written to stdout; redirect it to a file for CI upload.

| Scenario result                               | JUnit representation           |
| --------------------------------------------- | ------------------------------ |
| Expectations pass                             | Passing `<testcase>`           |
| Assertion fails                               | `<failure>`                    |
| Unexpected execution error fails verification | `<error>`                      |
| Observer is configured                        | Separate observer `<testcase>` |

An expected primary error or timeout can still produce a passing testcase when its expectations
pass. Observer execution errors always fail verification.

Primary, observer, and adapter execution cases use separate class names. Durations are written in
seconds. External suite duration uses the adapter lifecycle total so execute and observe time is not
counted twice. Failed cases include their failure details. The execution testcase includes every
adapter operation's status and duration in `<system-out>`, including successful operations.
Scenario names, messages, and diagnostics are escaped before they are
written to XML.

Command failures, including invalid arguments and scenario or target loading errors, are emitted as
JUnit `<error>` results when `--report junit` is selected.
