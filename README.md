# mcplab.dev

Website and documentation for [MCP Lab](https://mcplab.dev). MCP Lab is the umbrella project; [MCP Failure Lab](https://github.com/anilloutombam/mcp-failure-lab) is its first tool.

The site contains:

- the MCP Lab homepage at `/`;
- the MCP Failure Lab project page at `/failure`;
- product documentation under `/docs`.

## Documentation policy

Product documentation must describe behavior available in the current MCP Failure Lab source or a published release. Do not describe roadmap work as implemented, and do not claim protocol compliance.

The source repository remains authoritative when this site and the product diverge:

- [MCP Failure Lab repository](https://github.com/anilloutombam/mcp-failure-lab)
- [Latest MCP Failure Lab release](https://github.com/anilloutombam/mcp-failure-lab/releases/latest)

## Requirements

- Node.js 22.19.0 or newer
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
