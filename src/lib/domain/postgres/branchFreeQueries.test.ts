import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	buildSchema,
	FieldsOnCorrectTypeRule,
	getNamedType,
	isEnumType,
	isInputObjectType,
	isObjectType,
	KnownTypeNamesRule,
	parse,
	TypeInfo,
	validate,
	visit,
	visitWithTypeInfo
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

// Only historical activity identities and scalar event data may reference branches.
// Retired read types must not be reintroduced by active Console documents.
function retiredBranchType(name: string): boolean {
	return (
		name.startsWith('PostgresBranch') &&
		!/^PostgresBranch(?:Created|Activated|Deleted)?ActivityLogEntry(?:Data)?$/.test(name)
	);
}

describe('branch-free Console GraphQL documents', () => {
	test('uses the final retired schema without branch read types, fields, or input compatibility', () => {
		expect(Object.keys(schema.getTypeMap()).filter(retiredBranchType)).toEqual([]);
		for (const name of ['IssueType', 'ResourceType']) {
			const type = schema.getType(name);
			if (!isEnumType(type)) throw new Error(`Missing ${name} enum`);
			expect(type.getValues().map(({ name }) => name)).not.toContain('POSTGRES_BRANCH');
		}
		const postgres = schema.getType('Postgres');
		if (!isObjectType(postgres)) throw new Error('Missing Postgres type');
		for (const field of ['branch', 'branches', 'activeBranch', 'desiredActiveBranch']) {
			expect(postgres.getFields()).not.toHaveProperty(field);
		}
		const accessInput = schema.getType('CreatePostgresAccessInput');
		if (!isInputObjectType(accessInput)) throw new Error('Missing Postgres access input');
		expect(accessInput.getFields()).not.toHaveProperty('branch');
		const inventory = schema.getType('TeamInventoryCounts');
		if (!isObjectType(inventory)) throw new Error('Missing team inventory counts');
		expect(inventory.getFields()).not.toHaveProperty('postgresBranches');
	});

	test.each(['PostgresBranch', 'PostgresBranchIssue', 'PostgresBranchConnection'])(
		'rejects retired %s query types',
		(name) => {
			expect(retiredBranchType(name)).toBe(true);
		}
	);

	test.each([
		'PostgresBranchActivityLogEntryData',
		'PostgresBranchCreatedActivityLogEntry',
		'PostgresBranchActivatedActivityLogEntry',
		'PostgresBranchDeletedActivityLogEntry'
	])('preserves historical %s activity types', (name) => {
		expect(retiredBranchType(name)).toBe(false);
		expect(schema.getType(name)).toBeDefined();
	});

	test('discovers page queries and inline component documents', () => {
		expect(documents.some(({ path }) => path === 'routes/homeAttention.gql')).toBe(true);
		expect(
			documents.some(({ path }) => path.startsWith('lib/domain/issues/CriticalIssueRow.svelte'))
		).toBe(true);
	});

	test.each(documents)('$path does not require the retired branch model', ({ source }) => {
		const document = parse(source);
		// Keep the test useful after the obsolete fields/types disappear from the schema.
		expect(
			validate(schema, document, [FieldsOnCorrectTypeRule, KnownTypeNamesRule]).map(
				(error) => error.message
			)
		).toEqual([]);

		const dependencies: string[] = [];
		const typeInfo = new TypeInfo(schema);
		visit(
			document,
			visitWithTypeInfo(typeInfo, {
				NamedType(node) {
					if (retiredBranchType(node.name.value)) dependencies.push(node.name.value);
				},
				Field(node) {
					const parent = typeInfo.getParentType()?.name;
					const field = node.name.value; // Aliases do not introduce schema dependencies.
					const type = typeInfo.getType();
					if (
						[
							'activeBranch',
							'desiredActiveBranch',
							'branches',
							'postgresBranch',
							'postgresBranches'
						].includes(field) ||
						(field === 'branch' && parent !== 'PostgresBranchActivityLogEntryData') ||
						(type && retiredBranchType(getNamedType(type).name))
					) {
						dependencies.push(`${parent}.${field}`);
					}
				}
			})
		);
		expect(dependencies).toEqual([]);
	});
});
