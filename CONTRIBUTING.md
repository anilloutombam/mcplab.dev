# Contributing to mcplab.dev

This repository contains the MCP Lab website and MCP Failure Lab documentation.

## Before making a change

- Confirm product behavior against the current [`mcp-failure-lab`](https://github.com/anilloutombam/mcp-failure-lab) source or release documentation.
- Do not present roadmap items as implemented behavior.
- Keep commands and scenario examples executable.
- Use direct technical language and avoid unsupported compliance claims.

## Local development

```sh
npm install
npm run dev
```

## Validation

Run the production build before opening a pull request:

```sh
npm run build
```

Documentation lives in `src/content/docs/`. The marketing pages are `src/pages/index.astro` and `src/pages/failure.astro`.

## Pull requests

Keep each pull request focused. Describe the behavior or documentation source that justifies product-content changes.
