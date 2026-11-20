import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	buildSchema,
	FieldsOnCorrectTypeRule,
	KnownTypeNamesRule,
	parse,
	validate,
	ValuesOfCorrectTypeRule
} from 'graphql';

const root = new URL('../../../../', import.meta.url);
const schema = buildSchema(readFileSync(new URL('schema.graphql', root), 'utf8'), {
	assumeValid: true
});

const documents = readdirSync(new URL('src/', root), { recursive: true, encoding: 'utf8' })
	.filter((path) => /\.(?:gql|graphql|svelte|ts|js)$/.test(path) && !path.includes('.test.'))
	.flatMap((path) => {
		const source = readFileSync(fileURLToPath(new URL(`src/${path}`, root)), 'utf8');
		if (/\.(?:gql|graphql)$/.test(path)) return [{ path, source }];
		return [...source.matchAll(/\bgraphql\(\s*`([^`]+)`\s*\)/g)].map((match, index) => ({
			path: `${path} (document ${index + 1})`,
			source: match[1]
		}));
	});

describe('Console GraphQL documents', () => {
	test('discovers page queries and inline component documents', () => {
		expect(documents.some(({ path }) => path === 'routes/homeAttention.gql')).toBe(true);
		expect(
			documents.some(({ path }) => path.startsWith('lib/domain/issues/CriticalIssueRow.svelte'))
		).toBe(true);
	});

	test.each(documents)('$path validates against the current schema', ({ source }) => {
		expect(
			validate(schema, parse(source), [
				FieldsOnCorrectTypeRule,
				KnownTypeNamesRule,
				ValuesOfCorrectTypeRule
			]).map((error) => error.message)
		).toEqual([]);
	});
});
