import { readFileSync } from 'node:fs';
import { buildSchema, OverlappingFieldsCanBeMergedRule, parse, validate, visit } from 'graphql';

const component = readFileSync(
	new URL('../list-items/ActivityLogListItem.svelte', import.meta.url),
	'utf8'
);
const fragmentSource = component.match(
	/graphql\(\s*`(\s*fragment ActivityLogEntryFragment on ActivityLogEntry \{[\s\S]*?)`\s*\)/
)?.[1];

if (!fragmentSource) {
	throw new Error('ActivityLogEntryFragment not found in ActivityLogListItem.svelte');
}

const fragment = parse(fragmentSource);

const schema = buildSchema(
	readFileSync(new URL('../../../../schema.graphql', import.meta.url), 'utf8'),
	{ assumeValid: true }
);

describe('ActivityLogEntryFragment', () => {
	test('selects nullable and non-null team slugs without conflicting response fields', () => {
		const errors = validate(schema, fragment, [OverlappingFieldsCanBeMergedRule]);

		expect(errors.map((error) => error.message)).toEqual([]);
	});

	test('detects the team slug conflict when the Postgres alias is removed', () => {
		const document = visit(fragment, {
			Field(node) {
				if (node.alias?.value === 'postgresTeamSlug') {
					return { ...node, alias: undefined };
				}
			}
		});
		const errors = validate(schema, document, [OverlappingFieldsCanBeMergedRule]);

		expect(errors.some((error) => error.message.includes('Fields "teamSlug" conflict'))).toBe(true);
	});
});
