import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	buildSchema,
	FieldsOnCorrectTypeRule,
	getNamedType,
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
// Compatibility-only issue types must not be used by active Console documents.
function retiredBranchType(name: string): boolean {
	return (
		name.startsWith('PostgresBranch') &&
		!/^PostgresBranch(?:Created|Activated|Deleted)?ActivityLogEntry(?:Data)?$/.test(name)
	);
}

describe('branch-free Console GraphQL documents', () => {
	test.each(['PostgresBranch', 'PostgresBranchIssue', 'PostgresBranchConnection'])(
		'rejects compatibility-only %s query types',
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
