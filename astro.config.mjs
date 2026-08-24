// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://mcplab.dev',
	integrations: [
		starlight({
			title: 'MCP Lab',
			description: 'Deterministic failure testing for MCP systems.',
			favicon: '/favicon.png',
			customCss: ['./src/styles/starlight.css'],
			head: [
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#090a0c' } },
				{ tag: 'script', content: `const storedTheme = localStorage.getItem('starlight-theme'); if (storedTheme !== 'light' && storedTheme !== 'dark') localStorage.setItem('starlight-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.addEventListener('DOMContentLoaded', () => document.querySelector('select[aria-label="Select theme"] option[value="auto"]')?.remove());` },
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/anilloutombam/mcp-failure-lab' }],
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
