import { Kind, parse } from 'graphql';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { writable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { loadHigh, loadSeverity, loadNoSbom, loadSummary, summary } = vi.hoisted(() => {
	const summary = {
		missingSbomCount: 0,
		sbomCount: 1,
		workloadCount: 1,
		wait: undefined as (() => Promise<void>) | undefined
	};

	return {
		loadHigh: vi.fn(async () => ({})),
		loadSeverity: vi.fn(async () => ({})),
		loadNoSbom: vi.fn(async () => ({})),
		loadSummary: vi.fn(async (params: { blocking?: boolean }) => {
			if (params.blocking) await summary.wait?.();
			return {
				TeamVulnerabilities: {
					subscribe(run: (value: unknown) => void) {
						run({
							data: {
								team: {
									workloadsWithoutSbom: {
										pageInfo: { totalCount: summary.missingSbomCount }
									},
									workloads: { pageInfo: { totalCount: summary.workloadCount } },
									vulnerabilitySummary: { sbomCount: summary.sbomCount }
								}
							}
						});
						return () => {};
					}
				}
			};
		}),
		summary
	};
});

vi.mock('$houdini', () => ({
	load_TeamVulnerabilities: loadSummary,
	load_TeamPriorityWorkloadsHigh: loadHigh,
	load_TeamSeverityWorkloads: loadSeverity,
	load_TeamNoSbomWorkloads: loadNoSbom,
	OrderDirection: { DESC: 'DESC', ASC: 'ASC' },
	SBOMStatus: { NO_SBOM: 'NO_SBOM' },
	WorkloadOrderField: { NAME: 'NAME' },
	VulnerabilitySummaryOrderByField: {
		NAME: 'NAME',
		LABEL: 'LABEL',
		VULNERABILITY_RISK_SCORE: 'VULNERABILITY_RISK_SCORE',
		VULNERABILITY_SEVERITY_CRITICAL: 'VULNERABILITY_SEVERITY_CRITICAL'
	},
	TeamNoSbomWorkloadsStore: class {},
	TeamPriorityWorkloadsHighStore: class {},
	TeamSeverityWorkloadsStore: class {}
}));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn(async () => ({})) }));
vi.mock('$app/env', () => ({ browser: false, building: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$app/navigation', () => ({ goto: vi.fn(), invalidateAll: vi.fn() }));
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/team/mango-panda/vulnerabilities'),
		data: { tenantName: 'nais' }
	}
}));

import { load } from './+page';
import TeamVulnerabilityPage from './+page.svelte';
import WorkloadsWithoutSbom from '#lib/domain/vulnerability/WorkloadsWithoutSbom.svelte';

function event(query = ''): Parameters<typeof load>[0] {
	return {
		params: { team: 'example' },
		url: new URL(`https://console.example.com/team/example/vulnerabilities${query}`),
		untrack: (fn: () => unknown) => fn()
	} as Parameters<typeof load>[0];
}

afterEach(() => {
	vi.clearAllMocks();
	summary.missingSbomCount = 0;
	summary.sbomCount = 1;
	summary.workloadCount = 1;
	summary.wait = undefined;
});

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

	it('requests navigable pages for the missing-SBOM workload list', () => {
		const query = parse(readFileSync(new URL('./no-sbom.gql', import.meta.url), 'utf8'));
		const operation = query.definitions.find(
			(definition) => definition.kind === Kind.OPERATION_DEFINITION
		);
		if (operation?.kind !== Kind.OPERATION_DEFINITION) throw new Error('Missing operation');
		const team = operation.selectionSet.selections.find(
			(selection) => selection.kind === Kind.FIELD && selection.name.value === 'team'
		);
		if (team?.kind !== Kind.FIELD || !team.selectionSet) throw new Error('Missing team');
		const workloads = team.selectionSet.selections.find(
			(selection) => selection.kind === Kind.FIELD && selection.name.value === 'workloads'
		);
		if (workloads?.kind !== Kind.FIELD || !workloads.selectionSet) {
			throw new Error('Missing workloads');
		}

		expect(workloads.directives).toMatchObject([
			{
				name: { value: 'paginate' },
				arguments: [
					{
						name: { value: 'mode' },
						value: { kind: Kind.ENUM, value: 'SinglePage' }
					}
				]
			}
		]);
		const pageInfo = workloads.selectionSet.selections.find(
			(selection) => selection.kind === Kind.FIELD && selection.name.value === 'pageInfo'
		);
		if (pageInfo?.kind !== Kind.FIELD || !pageInfo.selectionSet)
			throw new Error('Missing pageInfo');
		expect(
			pageInfo.selectionSet.selections
				.filter((selection) => selection.kind === Kind.FIELD)
				.map((selection) => selection.name.value)
		).toEqual(
			expect.arrayContaining([
				'hasNextPage',
				'hasPreviousPage',
				'pageStart',
				'pageEnd',
				'startCursor',
				'endCursor',
				'totalCount'
			])
		);
	});

	it('loads all workloads on first navigation', async () => {
		await load(event());

		expect(loadSeverity).toHaveBeenCalledOnce();
		expect(loadSeverity).toHaveBeenCalledWith(
			expect.objectContaining({
				blocking: true,
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
		expect(loadHigh).toHaveBeenCalledWith(expect.objectContaining({ blocking: true }));
		expect(loadSeverity).not.toHaveBeenCalled();
	});

	it('loads the first no-SBOM workload page when the team has missing SBOMs', async () => {
		summary.missingSbomCount = 2;

		await load(event());

		expect(loadSummary).toHaveBeenCalledWith(expect.objectContaining({ blocking: true }));
		expect(loadNoSbom).toHaveBeenCalledOnce();
		expect(loadNoSbom).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: {
					team: 'example',
					first: 20,
					last: null,
					after: null,
					before: null,
					sbomStatus: 'NO_SBOM',
					orderBy: { field: 'NAME', direction: 'ASC' },
					environments: null,
					labels: []
				}
			})
		);
	});

	it('loads all team workloads when none has a usable SBOM, even if none has NO_SBOM status', async () => {
		summary.sbomCount = 0;
		summary.workloadCount = 1;

		await load(event());

		expect(loadNoSbom).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({ sbomStatus: null })
			})
		);
		expect(loadSeverity).not.toHaveBeenCalled();
	});

	it('does not request vulnerability rows when no workloads have usable SBOMs', async () => {
		summary.missingSbomCount = 61;
		summary.workloadCount = 62;
		summary.sbomCount = 0;

		await load(event());
		await load(event('?view=priority'));

		expect(loadNoSbom).toHaveBeenCalledTimes(2);
		expect(loadNoSbom).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({ sbomStatus: null })
			})
		);
		expect(loadSeverity).not.toHaveBeenCalled();
		expect(loadHigh).not.toHaveBeenCalled();
	});

	it('offers a reset when filters hide all workloads without usable SBOMs', async () => {
		const { body } = await render(TeamVulnerabilityPage, {
			props: {
				params: { team: 'mango-panda' },
				data: {
					teamSlug: 'mango-panda',
					selection: {
						environmentName: 'dev-fss',
						labels: [{ key: 'owner', value: 'retired' }],
						labelKey: '',
						labelDirection: 'ASC',
						view: 'severity'
					},
					TeamVulnerabilities: writable({
						data: {
							team: {
								workloadsWithoutSbom: { pageInfo: { totalCount: 61 } },
								workloads: { pageInfo: { totalCount: 62 } },
								applications: { facets: { labels: [] } },
								jobs: { facets: { labels: [] } },
								vulnerabilitySummary: { sbomCount: 0 }
							}
						},
						errors: null
					}),
					TeamNoSbomWorkloads: writable({
						data: {
							team: {
								workloads: {
									nodes: [],
									pageInfo: {
										totalCount: 0,
										hasNextPage: false,
										hasPreviousPage: false,
										pageStart: 0,
										pageEnd: 0,
										startCursor: null,
										endCursor: null
									}
								}
							}
						},
						errors: null,
						fetching: false
					})
				} as unknown as ComponentProps<typeof TeamVulnerabilityPage>['data']
			}
		});

		expect(body).toContain('No usable SBOMs are available for this team');
		expect(body).toContain('61 workloads have no');
		expect(body).toContain('<details>');
		expect(body).toContain('Workloads without usable SBOM (0)');
		expect(body).not.toContain('Workload Vulnerabilities');
		expect(body).toContain('Clear workload filters');
	});

	it('identifies a workload when the team has no usable SBOM but no NO_SBOM status', async () => {
		const { body } = await render(TeamVulnerabilityPage, {
			props: {
				params: { team: 'mango-panda' },
				data: {
					teamSlug: 'mango-panda',
					selection: {
						environmentName: null,
						labels: [],
						labelKey: '',
						labelDirection: 'ASC',
						view: 'severity'
					},
					TeamVulnerabilities: writable({
						data: {
							team: {
								workloadsWithoutSbom: { pageInfo: { totalCount: 0 } },
								workloads: { pageInfo: { totalCount: 1 } },
								applications: { facets: { labels: [] } },
								jobs: { facets: { labels: [] } },
								vulnerabilitySummary: { sbomCount: 0 }
							}
						},
						errors: null
					}),
					TeamNoSbomWorkloads: writable({
						data: {
							team: {
								workloads: {
									nodes: [
										{
											__typename: 'Application',
											id: 'polaris',
											name: 'polaris',
											team: { slug: 'mango-panda' },
											teamEnvironment: { environment: { name: 'dev-fss' } }
										}
									],
									pageInfo: {
										totalCount: 1,
										hasNextPage: false,
										hasPreviousPage: false,
										pageStart: 1,
										pageEnd: 1,
										startCursor: 'cursor-1',
										endCursor: 'cursor-1'
									}
								}
							}
						},
						errors: null,
						fetching: false
					})
				} as unknown as ComponentProps<typeof TeamVulnerabilityPage>['data']
			}
		});

		expect(body).toContain('Workloads without usable SBOM (1)');
		expect(body).not.toContain('Clear workload filters');
		expect(body).toMatch(/vulnerability data is unavailable for\s+1\s+workload\./);
		expect(body).not.toContain('1 workload has no SBOM.');
		expect(body).not.toContain('documentation .');
		expect(body).toContain('<details open="">');
		expect(body).toContain('/team/mango-panda/dev-fss/app/polaris/vulnerabilities');
	});

	it('shows the current range and enables going back from the second SBOM page', async () => {
		const workloadsWithoutSbom = writable({
			data: {
				team: {
					workloads: {
						nodes: [
							{
								__typename: 'Application',
								id: 'app-21',
								name: 'app-21',
								team: { slug: 'mango-panda' },
								teamEnvironment: { environment: { name: 'dev-fss' } }
							}
						],
						pageInfo: {
							totalCount: 61,
							pageStart: 21,
							pageEnd: 21,
							hasNextPage: true,
							hasPreviousPage: true,
							startCursor: 'cursor-21',
							endCursor: 'cursor-21'
						}
					}
				}
			},
			errors: null,
			fetching: false
		});
		const { body } = await render(WorkloadsWithoutSbom, {
			props: {
				count: 61,
				workloadsWithoutSbom: workloadsWithoutSbom as unknown as ComponentProps<
					typeof WorkloadsWithoutSbom
				>['workloadsWithoutSbom']
			}
		});

		expect(body).toContain('21');
		expect(body).toContain('of 61');
		expect(body).toContain('app-21');
		const previous = body.match(/<button\b[^>]*aria-label="Previous page"[^>]*>/)?.[0];
		expect(previous).toBeDefined();
		expect(previous).not.toContain('disabled');
	});

	it('keeps previous-page navigation when a later SBOM page becomes empty', async () => {
		const workloadsWithoutSbom = writable({
			data: {
				team: {
					workloads: {
						nodes: [],
						pageInfo: {
							totalCount: 61,
							pageStart: 41,
							pageEnd: 40,
							hasNextPage: false,
							hasPreviousPage: true,
							startCursor: null,
							endCursor: null
						}
					}
				}
			},
			errors: null,
			fetching: false
		});
		const { body } = await render(WorkloadsWithoutSbom, {
			props: {
				count: 61,
				workloadsWithoutSbom: workloadsWithoutSbom as unknown as ComponentProps<
					typeof WorkloadsWithoutSbom
				>['workloadsWithoutSbom']
			}
		});

		expect(body).toContain('No workloads on this page.');
		expect(body).not.toContain('No workloads without SBOM.');
		const previous = body.match(/<button\b[^>]*aria-label="Previous page"[^>]*>/)?.[0];
		expect(previous).toBeDefined();
		expect(previous).not.toContain('disabled');
	});

	it('passes the selected environment and labels to both workload lists on the initial render', async () => {
		summary.missingSbomCount = 2;
		await load(event('?view=priority&environment=dev&labels=owner%3Ateam&labelKey=owner'));

		const labels = [{ key: 'owner', value: 'team' }];
		expect(loadNoSbom).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({ environments: ['dev'], labels })
			})
		);
		expect(loadHigh).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					environmentName: 'dev',
					labels,
					orderBy: { field: 'LABEL', direction: 'ASC', labelKey: 'owner' }
				})
			})
		);
	});

	it('loads severity by default when filters are set without selecting a view', async () => {
		await load(event('?labels=region'));
		expect(loadSeverity).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({ labels: [{ key: 'region', value: undefined }] })
			})
		);
		expect(loadHigh).not.toHaveBeenCalled();
	});

	it('waits for the summary before deciding whether to load missing-SBOM workloads', async () => {
		summary.missingSbomCount = 2;
		let resolveSummary: () => void = () => {};
		const summaryPromise = new Promise<void>((resolve) => {
			resolveSummary = resolve;
		});
		summary.wait = () => summaryPromise;

		const result = load(event());
		await Promise.resolve();

		expect(loadNoSbom).not.toHaveBeenCalled();

		resolveSummary();
		await result;

		expect(loadNoSbom).toHaveBeenCalledOnce();
	});

	it('does not load the no-SBOM workload list when there are none', async () => {
		await load(event());

		expect(loadNoSbom).not.toHaveBeenCalled();
	});
});
