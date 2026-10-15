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
