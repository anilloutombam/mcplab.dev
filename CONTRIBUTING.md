# Contributing to mcplab.dev

This repository contains the MCP Lab website and MCP Failure Lab documentation.

## Requirements

- Node.js 22.19.0 or newer
- npm

## First contribution

Small documentation corrections, broken links, accessibility improvements, and focused examples are good places to start.

Before beginning a larger design, navigation, or documentation-structure change, open an issue to discuss the proposal.

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

Review the Vercel preview before merging. Check links and navigation, and inspect light theme, dark theme, and mobile layout when the change affects presentation.
