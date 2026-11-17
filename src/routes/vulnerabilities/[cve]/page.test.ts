import { afterEach, describe, expect, it, vi } from 'vitest';

const { loadDetails, loadWorkloads } = vi.hoisted(() => ({
	loadDetails: vi.fn(async () => ({})),
	loadWorkloads: vi.fn(async () => ({}))
}));

vi.mock('$houdini', () => ({
	load_CVEDetails: loadDetails,
	load_CVEWorkloads: loadWorkloads,
	CVEWorkloadOrderField: { TEAM: 'TEAM' }
}));
vi.mock('#lib/domain/vulnerability/cveWorkloadOrder.js', () => ({
	cveWorkloadOrder: vi.fn(() => ({ field: 'TEAM', direction: 'ASC' }))
}));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn(async () => ({})) }));

import { load } from './+page';

function event(query = ''): Parameters<typeof load>[0] {
	return {
		params: { cve: 'CVE-2026-1234' },
		url: new URL(`https://console.example.com/vulnerabilities/CVE-2026-1234${query}`)
	} as Parameters<typeof load>[0];
}

afterEach(() => {
	vi.clearAllMocks();
});

describe('CVE workload team scope', () => {
	it('uses viewer memberships when My teams is selected', async () => {
		const result = await load(event('?myTeams=true'));

		expect(result.onlyMyTeams).toBe(true);
		expect(loadWorkloads).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					filter: { teamScope: { memberOfViewer: true } },
					onlyMyTeams: true,
					first: 25,
					after: ''
				})
			})
		);
	});

	it.each(['', '?myTeams=false'])('leaves workloads unfiltered for %s', async (query) => {
		const result = await load(event(query));

		expect(result.onlyMyTeams).toBe(false);
		expect(loadWorkloads).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({ filter: null, onlyMyTeams: false })
			})
		);
	});

	it('preserves the team scope when paging backwards', async () => {
		await load(event('?myTeams=true&before=previous-page'));

		expect(loadWorkloads).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					filter: { teamScope: { memberOfViewer: true } },
					last: 25,
					before: 'previous-page'
				})
			})
		);
	});
});
