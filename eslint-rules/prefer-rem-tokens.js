import fs from 'node:fs';
import path from 'node:path';

const SPACING_PROPERTY =
	/^(?:(?:margin|padding|inset)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|(?:row-|column-)?gap|top|right|bottom|left)$/;
const TOKEN_FILES = new Set(['src/styles/shadcn.css', 'src/styles/app.css']);

function maskComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
		.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function prefixes(property) {
	if (property === 'font-size') return ['--ax-font-size-', '--sh-font-size-'];
	if (property === 'line-height') return ['--ax-font-line-height-', '--sh-line-height-'];
	if (property.endsWith('radius')) return ['--ax-radius-'];
	if (SPACING_PROPERTY.test(property)) return ['--ax-space-'];
	return [];
}

export function findTokenizableRems(source, tokenSource, filename = '') {
	const tokens = [...maskComments(tokenSource).matchAll(/(--[\w-]+):\s*([\d.]+)rem\s*;/g)];
	const normalizedFilename = filename.split(path.sep).join('/');
	const masked = maskComments(source).replace(/@(media|container)[^{]*\{/g, (query) =>
		query.replace(/[^\n]/g, ' ')
	);
	const declarations = [
		...masked.matchAll(/([\w-]+)\s*:\s*([^;{}\n]*)/g),
		...masked.matchAll(/style:([\w-]+)(?:\|important)?\s*=\s*["']([^"']*)/g)
	];
	const results = [];

	for (const declaration of declarations) {
		const [, property, value] = declaration;
		if (TOKEN_FILES.has(normalizedFilename) && property.startsWith('--')) continue;
		const candidates = prefixes(property).flatMap((prefix) =>
			tokens.filter((token) => token[1].startsWith(prefix))
		);
		const valueStart = declaration.index + declaration[0].length - value.length;

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
