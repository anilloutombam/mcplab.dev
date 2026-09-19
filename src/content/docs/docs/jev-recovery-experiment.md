---
title: Jev recovery-evidence experiment
description: A controlled A/B test of how Jev 1.13 decisions change when MCP failure evidence includes successful recovery.
---

On 2026-09-19, we ran a controlled experiment to measure whether explicit recovery evidence changes
Jev's decision after the same MCP fault.

:::caution[Decision-layer experiment]
This is not an MCP client conformance benchmark. Jev did not connect to an MCP server or implement
an MCP transport. MCP Failure Lab produced the faults and operational evidence; Jev evaluated that
evidence as a downstream decision model.
:::

## Method

The experiment used `mcp-failure-lab@0.10.0` and the
`typesafe/jev-1.13-20260917` model through OpenRouter. Each of six cases ran 20 times using the same
decision prompt and `accept`, `retry`, or `reject` choices.

The duplicate-response and disconnect cases were paired A/B comparisons. Within each pair, the
fault evidence remained the same. Only the recovery variant included evidence that a follow-up
`ping` succeeded.

Jev received normalized operational evidence only:

- observed execution outcome;
- fault type and result usability;
- optional recovery evidence.

MCP Failure Lab expectations and assertion results were excluded. This prevents “the injected fault
occurred as expected” from being mistaken for “the agent should continue.”

## Results

| Scenario                       | Choices across 20 runs | P(accept) | P(retry) | P(reject) | Confidence |
| ------------------------------ | ---------------------: | --------: | -------: | --------: | ---------: |
| Clean                          |              20 accept |     0.988 |        0 |     0.012 |      0.984 |
| Hang timeout                   |              20 reject |         0 |    0.415 |     0.585 |      0.376 |
| Duplicate, no recovery         |              20 reject |         0 |    0.102 |     0.898 |      0.846 |
| Duplicate, recovery succeeded  |              20 accept |     0.535 |    0.351 |     0.115 |      0.301 |
| Disconnect, no recovery        |              20 reject |         0 |     0.33 |     0.669 |      0.503 |
| Disconnect, recovery succeeded |               20 retry |     0.162 |     0.79 |     0.048 |      0.687 |

### Recovery effect

The deltas below are the averages with recovery evidence minus the averages without it.

| Comparison          | Δ P(accept) | Δ P(retry) | Δ confidence |
| ------------------- | ----------: | ---------: | -----------: |
| Duplicate recovery  |      +0.535 |     +0.249 |       -0.545 |
| Disconnect recovery |      +0.162 |      +0.46 |       +0.184 |

## Interpretation

Recovery evidence materially changed Jev's decision:

- Duplicate responses shifted from 20/20 reject to 20/20 accept after a successful recovery
  `ping`.
- Disconnects shifted from 20/20 reject to 20/20 retry after a successful recovery `ping`.

The recovered faults did not produce the same policy. After a duplicate response, continuing became
plausible. After a disconnect, retrying remained the consistent choice. Duplicate recovery reduced
average confidence, while disconnect recovery increased it.

These results apply to this model build, prompt, evidence representation, and 20-run sample. They do
not establish general Jev behavior or overall MCP resilience.

## Reproduce the experiment

The repository contains the full report, runner, summarizer, and exact decision schema:

- [Experiment report](https://github.com/anilloutombam/mcp-failure-lab/blob/main/docs/compatibility/jev-1.13.md)
- [Reproduction harness](https://github.com/anilloutombam/mcp-failure-lab/tree/main/experiments/jev)
