import { readFileSync } from 'node:fs';
import {
	buildSchema,
	FieldsOnCorrectTypeRule,
	Kind,
	OverlappingFieldsCanBeMergedRule,
	parse,
	validate,
	visit
} from 'graphql';

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
	test.each([
		'PostgresBranchCreatedActivityLogEntry',
		'PostgresBranchActivatedActivityLogEntry',
		'PostgresBranchDeletedActivityLogEntry',
		'PostgresCreatedActivityLogEntry',
		'PostgresUpdatedActivityLogEntry',
		'PostgresDeletedActivityLogEntry',
		'PostgresGrantAccessActivityLogEntry',
		'PostgresPersonalAccessCreatedActivityLogEntry',
		'PostgresPersonalAccessConnectionActivityLogEntry'
	])('selects all presenter fields on %s for SSR', (typeName) => {
		const definition = fragment.definitions.find(
			(definition) => definition.kind === Kind.FRAGMENT_DEFINITION
		);
		const selection = definition?.selectionSet.selections.find(
			(selection) =>
				selection.kind === Kind.INLINE_FRAGMENT && selection.typeCondition?.name.value === typeName
		);
		if (selection?.kind !== Kind.INLINE_FRAGMENT) {
			throw new Error(`Missing concrete fragment for ${typeName}`);
		}
		const fields = selection.selectionSet.selections
			.filter((field) => field.kind === Kind.FIELD)
			.map((field) => [field.alias?.value ?? field.name.value, field.name.value]);

		expect(fields).toEqual(
			expect.arrayContaining([
				['__typename', '__typename'],
				['id', 'id'],
				['createdAt', 'createdAt'],
				['actor', 'actor'],
				['environmentName', 'environmentName'],
				['message', 'message'],
				['resourceName', 'resourceName'],
				['resourceType', 'resourceType'],
				['postgresTeamSlug', 'teamSlug']
			])
		);
		expect(validate(schema, fragment, [FieldsOnCorrectTypeRule])).toEqual([]);
	});

	test('selects nullable and non-null team slugs without conflicting response fields', () => {
		const errors = validate(schema, fragment, [OverlappingFieldsCanBeMergedRule]);

		expect(errors.map((error) => error.message)).toEqual([]);
	});

	test.each([
		['PostgresBranchCreatedActivityLogEntry', ['branch', 'sourceBranch', 'targetTime']],
		['PostgresBranchActivatedActivityLogEntry', ['branch']],
		['PostgresBranchDeletedActivityLogEntry', ['branch']]
	])('selects structured branch data on %s', (typeName, expectedFields) => {
		const definition = fragment.definitions.find(
			(definition) => definition.kind === Kind.FRAGMENT_DEFINITION
		);
		const selection = definition?.selectionSet.selections.find(
			(selection) =>
				selection.kind === Kind.INLINE_FRAGMENT && selection.typeCondition?.name.value === typeName
		);
		if (selection?.kind !== Kind.INLINE_FRAGMENT) {
			throw new Error(`Missing concrete fragment for ${typeName}`);
		}
		const data = selection.selectionSet.selections.find(
			(field) => field.kind === Kind.FIELD && field.alias?.value === 'postgresBranch'
		);
		if (data?.kind !== Kind.FIELD || !data.selectionSet) {
			throw new Error(`Missing branch data for ${typeName}`);
		}
		expect(
			data.selectionSet.selections
				.filter((field) => field.kind === Kind.FIELD)
				.map((field) => field.name.value)
		).toEqual(expectedFields);
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
