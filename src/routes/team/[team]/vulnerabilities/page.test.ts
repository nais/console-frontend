import { Kind, parse } from 'graphql';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { loadHigh, loadSeverity } = vi.hoisted(() => ({
	loadHigh: vi.fn(async () => ({})),
	loadSeverity: vi.fn(async () => ({}))
}));

vi.mock('$houdini', () => ({
	load_TeamVulnerabilities: vi.fn(async () => ({})),
	load_TeamPriorityWorkloadsHigh: loadHigh,
	load_TeamSeverityWorkloads: loadSeverity,
	OrderDirection: { DESC: 'DESC', ASC: 'ASC' },
	VulnerabilitySummaryOrderByField: {
		NAME: 'NAME',
		VULNERABILITY_RISK_SCORE: 'VULNERABILITY_RISK_SCORE',
		VULNERABILITY_SEVERITY_CRITICAL: 'VULNERABILITY_SEVERITY_CRITICAL'
	},
	TeamPriorityWorkloadsHighStore: class {},
	TeamSeverityWorkloadsStore: class {}
}));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn(async () => ({})) }));

import { load } from './+page';

function event(query = ''): Parameters<typeof load>[0] {
	return {
		params: { team: 'example' },
		url: new URL(`https://console.example.com/team/example/vulnerabilities${query}`),
		untrack: (fn: () => unknown) => fn()
	} as Parameters<typeof load>[0];
}

afterEach(() => vi.clearAllMocks());

describe('team vulnerability workload view', () => {
	it('requests the number of workloads with no SBOM', () => {
		const query = parse(readFileSync(new URL('./query.gql', import.meta.url), 'utf8'));
		const operation = query.definitions.find(
			(definition) => definition.kind === Kind.OPERATION_DEFINITION
		);
		if (operation?.kind !== Kind.OPERATION_DEFINITION) throw new Error('Missing operation');
		const team = operation.selectionSet.selections.find(
			(selection) => selection.kind === Kind.FIELD && selection.name.value === 'team'
		);
		if (team?.kind !== Kind.FIELD || !team.selectionSet) throw new Error('Missing team');
		const missingSboms = team.selectionSet.selections.find(
			(selection) =>
				selection.kind === Kind.FIELD && selection.alias?.value === 'workloadsWithoutSbom'
		);
		if (missingSboms?.kind !== Kind.FIELD) throw new Error('Missing workload count');
		expect(missingSboms.name.value).toBe('workloads');
		expect(
			missingSboms.arguments?.find((argument) => argument.name.value === 'filter')?.value
		).toMatchObject({
			kind: Kind.OBJECT,
			fields: [
				{
					kind: Kind.OBJECT_FIELD,
					name: { value: 'sbomStatus' },
					value: { kind: Kind.ENUM, value: 'NO_SBOM' }
				}
			]
		});
		expect(missingSboms.selectionSet?.selections).toMatchObject([
			{ kind: Kind.FIELD, name: { value: 'pageInfo' } }
		]);
	});

	it('loads all workloads on first navigation', async () => {
		await load(event());

		expect(loadSeverity).toHaveBeenCalledOnce();
		expect(loadSeverity).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					orderBy: { field: 'VULNERABILITY_SEVERITY_CRITICAL', direction: 'DESC' }
				})
			})
		);
		expect(loadHigh).not.toHaveBeenCalled();
	});

	it('loads priority groups when the view is selected', async () => {
		await load(event('?view=priority'));

		expect(loadHigh).toHaveBeenCalledOnce();
		expect(loadSeverity).not.toHaveBeenCalled();
	});
});
