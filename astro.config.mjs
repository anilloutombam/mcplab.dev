// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://mcplab.dev',
	integrations: [
		mermaid({
			autoTheme: true,
			enableLog: false,
			mermaidConfig: {
				flowchart: { curve: 'linear' },
				sequence: { mirrorActors: false },
			},
		}),
		starlight({
			title: 'MCP Lab',
			description: 'Deterministic failure testing for MCP systems.',
			favicon: '/favicon.png',
			components: {
				Head: './src/components/StarlightHead.astro',
			},
			customCss: ['./src/styles/starlight.css'],
			head: [
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#090a0c' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://mcplab.dev/og.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1731' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '909' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://mcplab.dev/og.png' } },
				{ tag: 'script', content: `const storedTheme = localStorage.getItem('starlight-theme'); if (storedTheme !== 'light' && storedTheme !== 'dark') localStorage.setItem('starlight-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.addEventListener('DOMContentLoaded', () => document.querySelector('select[aria-label="Select theme"] option[value="auto"]')?.remove());` },
			],
			social: [
				{ icon: 'heart', label: 'Support MCP Lab', href: '/support' },
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/anilloutombam/mcp-failure-lab' },
			],
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'Documentation', slug: 'docs' },
						{ label: 'Getting Started', slug: 'docs/getting-started' },
						{ label: 'Scenarios', slug: 'docs/scenarios' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'Fault Tools', slug: 'docs/fault-tools' },
						{ label: 'CLI', slug: 'docs/cli' },
						{ label: 'Reporting', slug: 'docs/reporting' },
					],
				},
				{
					label: 'Learn',
					items: [
						{ label: 'Examples', slug: 'docs/examples' },
						{ label: 'Architecture', slug: 'docs/architecture' },
						{ label: 'Development', slug: 'docs/development' },
						{ label: 'Troubleshooting', slug: 'docs/troubleshooting' },
					],
				},
			],
		}),
	],
});
