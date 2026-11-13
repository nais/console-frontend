import fs from 'node:fs';
import path from 'node:path';
import { parse, parseCss } from 'svelte/compiler';

const SPACING_PROPERTY =
	/^(?:(?:margin|padding|inset)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|(?:row-|column-)?gap|top|right|bottom|left)$/;
const TOKEN_FILES = new Set(['src/styles/shadcn.css', 'src/styles/app.css']);

function maskComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
		.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function prefixes(property) {
	if (property === 'font-size') return ['--sh-font-size-'];
	if (property === 'line-height') return ['--sh-font-line-height-'];
	if (property.endsWith('radius')) return ['--nais-radius-'];
	if (SPACING_PROPERTY.test(property)) return ['--nais-space-'];
	return [];
}

function findDeclarations(source, filename) {
	const declarations = [];

	function addStylesheet(styles, offset = 0) {
		const css = maskComments(styles);
		function visit(node) {
			if (node.type === 'Declaration') {
				const valueStart = css.indexOf(':', node.start) + 1;
				declarations.push({
					property: node.property,
					value: css.slice(valueStart, node.end),
					start: offset + valueStart
				});
			}
			for (const child of node.children ?? []) visit(child);
			if (node.block) visit(node.block);
		}
		visit(parseCss(css));
	}

	if (!filename.endsWith('.svelte')) {
		addStylesheet(source);
		return declarations;
	}

	const ast = parse(source, { modern: true, filename });
	if (ast.css) addStylesheet(ast.css.content.styles, ast.css.content.start);

	function visit(node) {
		if (!node || typeof node !== 'object') return;
		if ((node.type === 'Attribute' && node.name === 'style') || node.type === 'StyleDirective') {
			let chunks = node.value;
			if (
				chunks?.type === 'ExpressionTag' &&
				chunks.expression.type === 'Literal' &&
				typeof chunks.expression.value === 'string'
			) {
				chunks = [
					{
						type: 'Text',
						start: chunks.expression.start + 1,
						end: chunks.expression.end - 1
					}
				];
			}
			if (!Array.isArray(chunks) || chunks.length === 0) return;
			const value = maskComments(
				chunks
					.map((chunk) => {
						const text = source.slice(chunk.start, chunk.end);
						return chunk.type === 'Text' ? text : text.replace(/[^\n]/g, ' ');
					})
					.join('')
			).replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, (text) => text.replace(/[^\n]/g, ' '));
			if (node.type === 'StyleDirective') {
				declarations.push({ property: node.name, value, start: chunks[0].start });
			} else {
				for (const match of value.matchAll(/([\w-]+)\s*:\s*([^;{}]*)/g)) {
					declarations.push({
						property: match[1],
						value: match[2],
						start: chunks[0].start + match.index + match[0].length - match[2].length
					});
				}
			}
			return;
		}
		for (const child of Object.values(node)) visit(child);
	}
	visit(ast.fragment);
	return declarations;
}

export function findTokenizableRems(source, tokenSource, filename = '') {
	const tokens = [...maskComments(tokenSource).matchAll(/(--[\w-]+):\s*([\d.]+)rem\s*;/g)];
	const normalizedFilename = filename.split(path.sep).join('/');
	const results = [];

	for (const { property, value, start: valueStart } of findDeclarations(source, filename)) {
		if (TOKEN_FILES.has(normalizedFilename) && property.startsWith('--')) continue;
		const candidates = prefixes(property).flatMap((prefix) =>
			tokens.filter((token) => token[1].startsWith(prefix))
		);
		for (const literal of value.matchAll(/-?(?:\d+(?:\.\d+)?|\.\d+)rem\b/g)) {
			const numericValue = Number.parseFloat(literal[0]);
			const token = candidates.find((candidate) => Number(candidate[2]) === Math.abs(numericValue));
			if (!token) continue;
			const start = valueStart + literal.index;
			const reference = `var(${token[1]})`;
			results.push({
				property,
				value: literal[0],
				replacement: numericValue < 0 ? `calc(-1 * ${reference})` : reference,
				start,
				end: start + literal[0].length,
				line: source.slice(0, start).split('\n').length
			});
		}
	}

	return results.sort((a, b) => a.start - b.start);
}

function collectMatches(projectRoot, tokenSource) {
	const matches = [];

	function walk(directory) {
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const filename = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				walk(filename);
			} else if (entry.isFile() && /\.(svelte|css)$/.test(filename)) {
				const relative = path.relative(projectRoot, filename);
				for (const match of findTokenizableRems(
					fs.readFileSync(filename, 'utf8'),
					tokenSource,
					relative
				)) {
					matches.push({ ...match, filename: relative });
				}
			}
		}
	}

	walk(path.join(projectRoot, 'src'));
	return matches;
}

export default {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Require existing, exact-value design tokens instead of literal rem lengths'
		},
		schema: []
	},
	create(context) {
		if (path.basename(context.filename) !== 'eslint.config.js') return {};
		const root = path.dirname(context.filename);
		return {
			'Program:exit'() {
				const tokenSource = fs.readFileSync(path.join(root, 'src/styles/shadcn.css'), 'utf8');
				for (const match of collectMatches(root, tokenSource)) {
					context.report({
						loc: { line: 1, column: 0 },
						message: `${match.filename}:${match.line}: ${match.property}: ${match.value} should use ${match.replacement}.`
					});
				}
			}
		};
	}
};
