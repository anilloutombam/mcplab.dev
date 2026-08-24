---
title: Development
description: Set up, validate, and contribute to MCP Failure Lab.
---

```sh
git clone https://github.com/anilloutombam/mcp-failure-lab.git
cd mcp-failure-lab
npm install
```

## Common commands

```sh
npm run dev -- --help
npm run dev -- demo
npm --silent run dev -- serve
npm run format:check
npm run typecheck
npm test
npm run build
```

Tests are grouped by responsibility: unit tests for isolated behavior, integration tests for MCP client-server communication and transports, and end-to-end tests for CLI commands and child-process scenario execution. Injectable clocks and delay implementations keep timing assertions deterministic.

Before a pull request, run formatting checks, type validation, tests, and a clean build. See the repository’s `CONTRIBUTING.md` for the current contribution workflow.
