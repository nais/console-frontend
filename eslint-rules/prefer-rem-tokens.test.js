import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import rule, { findTokenizableRems } from './prefer-rem-tokens.js';

const fixtures = [];

afterEach(() => {
	for (const fixture of fixtures) fs.rmSync(fixture, { recursive: true });
	fixtures.length = 0;
});

const tokens = `
	--ax-space-6: 0.375rem;
	--ax-space-8: 0.5rem;
	--ax-space-16: 1rem;
	--ax-space-24: 1.5rem;
	--ax-radius-4: 0.25rem;
	--ax-font-size-small: 0.875rem;
	--sh-font-size-micro: 0.75rem;
	--sh-font-size-body: 0.9375rem;
	--sh-line-height-compact: 1.25rem;
	--ax-font-line-height-large: 1.5rem;
`;

describe('exact rem token matches', () => {
	it('uses property-appropriate tokens, not spacing tokens for typography', () => {
		const matches = findTokenizableRems(
			'.example { padding: 0.5rem 1rem; font-size: 0.875rem; line-height: 1.5rem; border-radius: 0.25rem; }',
			tokens
		);
		expect(matches.map((match) => match.replacement)).toEqual([
			'var(--ax-space-8)',
			'var(--ax-space-16)',
			'var(--ax-font-size-small)',
			'var(--ax-font-line-height-large)',
			'var(--ax-radius-4)'
		]);
		expect(findTokenizableRems('p { font-size: 1.5rem; }', tokens)).toEqual([]);
	});

	it('preserves smaller type sizes instead of increasing them to the nearest token', () => {
		expect(
			findTokenizableRems('p { font-size: 0.75rem; } span { font-size: 0.9375rem; }', tokens).map(
				(match) => match.replacement
			)
		).toEqual(['var(--sh-font-size-micro)', 'var(--sh-font-size-body)']);
		expect(findTokenizableRems('p { font-size: 0.8125rem; }', tokens)).toEqual([]);
	});

	it('uses the shared compact line-height token for an exact match', () => {
		expect(
			findTokenizableRems('p { line-height: 1.25rem; }', tokens).map((match) => match.replacement)
		).toEqual(['var(--sh-line-height-compact)']);
	});

	it('does not substitute spacing tokens for control, icon, or layout dimensions', () => {
		expect(
			findTokenizableRems(
				'.icon { width: 1rem; height: 1.5rem; min-inline-size: 1rem; max-block-size: 1rem; --surface-icon-size: 1rem; --surface-icon-glyph-size: 1.5rem; --instancegroup-list-columns: 1rem 1rem; }',
				tokens
			)
		).toEqual([]);
	});

	it('preserves negative margins with valid CSS arithmetic', () => {
		expect(
			findTokenizableRems('p { margin: -0.5rem -0.375rem; }', tokens).map(
				(match) => match.replacement
			)
		).toEqual(['calc(-1 * var(--ax-space-8))', 'calc(-1 * var(--ax-space-6))']);
	});

	it('finds inline styles and Svelte style directives', () => {
		const source = `<div style="padding: 0.5rem; font-size: 0.875rem" style:margin-top="1rem"></div>`;
		expect(findTokenizableRems(source, tokens).map((match) => match.replacement)).toEqual([
			'var(--ax-space-8)',
			'var(--ax-font-size-small)',
			'var(--ax-space-16)'
		]);
	});

	it('reports exact source ranges and line numbers', () => {
		const source = '<style>\n.example {\n\tgap: 0.5rem;\n}\n</style>';
		const [match] = findTokenizableRems(source, tokens);
		expect(source.slice(match.start, match.end)).toBe('0.5rem');
		expect(match.line).toBe(3);
	});

	it('leaves unmatched lengths unchanged without rounding or introducing tokens', () => {
		expect(
			findTokenizableRems(
				'p { padding: 0.3rem; max-width: 38rem; border-radius: 0.375rem; }',
				tokens
			)
		).toEqual([]);
	});

	it('ignores comments and media/container query conditions', () => {
		expect(
			findTokenizableRems(
				'/* padding: 1rem; */ <!-- gap: 1rem --> @media (min-width: 1rem) {} @container (width < 1rem) {}',
				tokens
			)
		).toEqual([]);
	});

	it('allows canonical token definitions but checks regular declarations in token files', () => {
		const source = ':root { --example: 1rem; } .example { padding: 1rem; }';
		for (const filename of ['src/styles/shadcn.css', 'src/styles/app.css']) {
			expect(findTokenizableRems(source, tokens, filename).map((match) => match.property)).toEqual([
				'padding'
			]);
		}
	});

	it('reports source references through the project-wide ESLint check', () => {
		const root = fs.mkdtempSync(path.join(os.tmpdir(), 'console-rem-tokens-'));
		fixtures.push(root);
		fs.mkdirSync(path.join(root, 'src/styles'), { recursive: true });
		fs.writeFileSync(path.join(root, 'src/styles/shadcn.css'), `:root { ${tokens} }`);
		fs.writeFileSync(
			path.join(root, 'src/Example.svelte'),
			'<style>\np { gap: 0.5rem; padding: 0.3rem; }\n</style>'
		);
		fs.writeFileSync(path.join(root, 'src/styles/example.css'), 'p { font-size: 0.875rem; }');
		const report = vi.fn();
		const listeners = rule.create({ filename: path.join(root, 'eslint.config.js'), report });
		listeners['Program:exit']();
		expect(report.mock.calls.map(([entry]) => entry.message)).toEqual([
			`${path.join('src', 'Example.svelte')}:2: gap: 0.5rem should use var(--ax-space-8).`,
			`${path.join('src', 'styles', 'example.css')}:1: font-size: 0.875rem should use var(--ax-font-size-small).`
		]);
	});

	it('runs once from eslint.config.js rather than scanning for every linted file', () => {
		expect(rule.create({ filename: '/example/src/Component.svelte' })).toEqual({});
	});
});
