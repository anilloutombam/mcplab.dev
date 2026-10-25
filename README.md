# mcplab.dev

Website and documentation for [MCP Lab](https://mcplab.dev). MCP Lab is the umbrella project; [MCP Failure Lab](https://github.com/anilloutombam/mcp-failure-lab) is its first tool.

The site contains:

- the MCP Lab homepage at `/`;
- the MCP Failure Lab project page at `/failure`;
- the community support page at `/support`;
- product documentation under `/docs`.

## Documentation policy

Product documentation must describe behavior available in the current MCP Failure Lab source or a published release. Do not describe roadmap work as implemented, and do not claim protocol compliance.

The source repository remains authoritative when this site and the product diverge:

- [MCP Failure Lab repository](https://github.com/anilloutombam/mcp-failure-lab)
- [Latest MCP Failure Lab release](https://github.com/anilloutombam/mcp-failure-lab/releases/latest)

## Requirements

- Node.js 22.23.4 (Node 22)
- npm

## Development

```sh
npm install
npm run dev
```

Astro prints the local URL when the development server starts.

## Production build

```sh
npm run build
npm run preview
```

The static production output is written to `dist/`.

The homepage loads npm downloads for the rolling last 30 available days and GitHub stars in the
browser. Project statistics are cached locally for one hour; the cache key is versioned when the
metric definition changes so an older window is never shown under a new label.

## Project structure

```text
src/
├── content/docs/        Starlight documentation
├── layouts/             Shared marketing-page layout
├── pages/               Homepage and Failure Lab page
└── styles/              Site and documentation styles
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
