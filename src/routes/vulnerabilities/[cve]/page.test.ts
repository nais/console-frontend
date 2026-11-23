import { afterEach, describe, expect, it, vi } from 'vitest';
import { CVEDetailsStore, CVEWorkloadsStore, type CVEDetails$result } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { get, readable } from 'svelte/store';
import { JSDOM } from 'jsdom';
import CvePage from './+page.svelte';

const { loadDetails, loadWorkloads } = vi.hoisted(() => ({
	loadDetails: vi.fn(async () => ({})),
	loadWorkloads: vi.fn(async () => ({}))
}));

vi.mock('$houdini', async (importOriginal) => ({
	...(await importOriginal<typeof import('$houdini')>()),
	graphql: () => ({}),
	fragment: (data: unknown) => readable(data),
	load_CVEDetails: loadDetails,
	load_CVEWorkloads: loadWorkloads
}));
vi.mock('#lib/domain/vulnerability/cveWorkloadOrder.js', () => ({
	cveWorkloadOrder: vi.fn(() => ({ field: 'TEAM', direction: 'ASC' }))
}));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn(async () => ({})) }));
vi.mock('$app/env', () => ({ browser: false, building: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/vulnerabilities/CVE-2026-1234'),
		data: { tenantName: 'nais' }
	}
}));

import { load } from './+page';

function event(query = ''): Parameters<typeof load>[0] {
	return {
		params: { cve: 'CVE-2026-1234' },
		url: new URL(`https://console.example.com/vulnerabilities/CVE-2026-1234${query}`)
	} as Parameters<typeof load>[0];
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.clearAllMocks();
});

async function renderDetails(riskAssessment: CVEDetails$result['cve']['riskAssessment']) {
	const details = new CVEDetailsStore();
	const initialDetails = get(details);
	vi.spyOn(details, 'subscribe').mockImplementation(
		readable<typeof initialDetails>({
			...initialDetails,
			fetching: false,
			data: {
				cve: {
					id: 'cve',
					identifier: 'CVE-2026-1234',
					title: 'Test CVE',
					severity: 'HIGH',
					detailsLink: 'https://example.com/cve',
					riskAssessment
				}
			}
		}).subscribe
	);
	const workloads = new CVEWorkloadsStore();
	return render(CvePage, {
		props: {
			params: { cve: 'CVE-2026-1234' },
			data: {
				CVEDetails: details,
				CVEWorkloads: workloads,
				onlyMyTeams: false
			} as ComponentProps<typeof CvePage>['data']
		},
		idPrefix: 'cve-details-'
	});
}

describe('CVE details', () => {
	it.each([0, 7.5])(
		'keeps CVSS %s and zero EPSS without operational priority',
		async (cvssScore) => {
			const { body } = await renderDetails({ cvssScore, hasKevEntry: true, epssScore: 0 });
			expect(body).toContain('CVE-2026-1234');
			expect(body).toContain('Test CVE');
			expect(body).toContain('Severity: HIGH');
			expect(body).toContain(`CVSS: ${cvssScore.toFixed(1)}`);
			expect(body).toContain('Known exploited');
			expect(body).toContain('EPSS 0.0%');
			expect(body).toContain('href="https://example.com/cve"');
			expect(body).not.toContain('Operational priority');
			expect(body).not.toContain('Priority:');
			const fragment = JSDOM.fragment(body);
			const sections = fragment.querySelectorAll('section[aria-labelledby]');
			expect(sections).toHaveLength(2);
			for (const section of sections) {
				const headingId = section.getAttribute('aria-labelledby');
				expect(headingId).toMatch(/^cve-details-/);
				expect(section.querySelector('h2')?.id).toBe(headingId);
			}
		}
	);

	it('does not invent missing CVSS or exploitation signals', async () => {
		const { body } = await renderDetails({
			cvssScore: null,
			hasKevEntry: false,
			epssScore: null
		});
		expect(body).toContain('Severity: HIGH');
		expect(body).not.toContain('CVSS:');
		expect(body).not.toContain('Known exploited');
		expect(body).not.toContain('EPSS 0.0%');
	});
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
