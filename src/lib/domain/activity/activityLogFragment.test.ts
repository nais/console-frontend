import { readFileSync } from 'node:fs';
import { buildSchema, OverlappingFieldsCanBeMergedRule, parse, validate, visit } from 'graphql';
import activityLogFragment from '$houdini/artifacts/ActivityLogEntryFragment';

const schema = buildSchema(
	readFileSync(new URL('../../../../schema.graphql', import.meta.url), 'utf8'),
	{ assumeValid: true }
);

describe('ActivityLogEntryFragment', () => {
	test('selects nullable and non-null team slugs without conflicting response fields', () => {
		const errors = validate(schema, parse(activityLogFragment.raw), [
			OverlappingFieldsCanBeMergedRule
		]);

		expect(errors.map((error) => error.message)).toEqual([]);
	});

	test('detects the team slug conflict when the Postgres alias is removed', () => {
		const document = visit(parse(activityLogFragment.raw), {
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
