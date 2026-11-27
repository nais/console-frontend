import { Kind, parse, print } from 'graphql';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { get, writable } from 'svelte/store';
import type { TeamV0sOverview$result } from '$houdini';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { loadHigh, loadSeverity, loadNoSbom, loadSummary, loadV0s, summary } = vi.hoisted(() => {
	const summary = {
		missingSbomCount: 0,
		sbomCount: 1,
		filteredSbomCount: undefined as number | undefined,
		workloadCount: 1,
		wait: undefined as (() => Promise<void>) | undefined
	};

	return {
		loadHigh: vi.fn(async () => ({})),
		loadSeverity: vi.fn(async () => ({})),
		loadNoSbom: vi.fn(async () => ({})),
		loadV0s: vi.fn(async () => ({ TeamV0sOverview: {} })),
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
									teamVulnerabilitySummary: { sbomCount: summary.sbomCount },
									vulnerabilitySummary: {
										sbomCount: summary.filteredSbomCount ?? summary.sbomCount
									}
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

vi.mock('$houdini', async () => {
	const { writable } = await import('svelte/store');
	class EmptyWorkloadStore {
		subscribe = writable({ data: null, errors: null }).subscribe;
	}
	return {
		graphql: () => new EmptyWorkloadStore(),
		load_TeamVulnerabilities: loadSummary,
		load_TeamV0sOverview: loadV0s,
		load_TeamPriorityWorkloadsHigh: loadHigh,
		load_TeamSeverityWorkloads: loadSeverity,
		load_TeamNoSbomWorkloads: loadNoSbom,
		OrderDirection: { DESC: 'DESC', ASC: 'ASC' },
		SBOMStatus: { NO_SBOM: 'NO_SBOM' },
		WorkloadOrderField: { NAME: 'NAME' },
		VulnerabilitySummaryOrderByField: {
			NAME: 'NAME',
			VULNERABILITY_RISK_SCORE: 'VULNERABILITY_RISK_SCORE',
			VULNERABILITY_SEVERITY_CRITICAL: 'VULNERABILITY_SEVERITY_CRITICAL'
		},
		TeamNoSbomWorkloadsStore: class {},
		TeamPriorityWorkloadsHighStore: EmptyWorkloadStore,
		TeamPriorityWorkloadsElevatedStore: EmptyWorkloadStore,
		TeamPriorityWorkloadsMonitorStore: EmptyWorkloadStore,
		TeamSeverityWorkloadsStore: EmptyWorkloadStore
	};
});
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn(async () => ({})) }));
vi.mock('$app/env', () => ({ browser: false, building: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn(),
	afterNavigate: vi.fn()
}));
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/team/mango-panda/vulnerabilities'),
		data: { tenantName: 'nais' }
	}
}));
vi.mock('$app/paths', () => ({
	resolve: (route: string, params: Record<string, string>) =>
		route.replace(/\[(\w+)\]/g, (_, key: string) => encodeURIComponent(params[key]))
}));

import { load } from './+page';
import TeamVulnerabilityPage from './+page.svelte';
import WorkloadsWithoutSbom from '#lib/domain/vulnerability/WorkloadsWithoutSbom.svelte';
import TeamV0sWorkloads from '#lib/domain/vulnerability/TeamV0sWorkloads.svelte';

function event(query = '', v0sVulnerabilities = false): Parameters<typeof load>[0] {
	return {
		params: { team: 'example' },
		url: new URL(`https://console.example.com/team/example/vulnerabilities${query}`),
		parent: async () => ({ v0sVulnerabilities }),
		untrack: (fn: () => unknown) => fn()
	} as Parameters<typeof load>[0];
}

afterEach(() => {
	vi.clearAllMocks();
	summary.missingSbomCount = 0;
	summary.sbomCount = 1;
	summary.filteredSbomCount = undefined;
	summary.workloadCount = 1;
	summary.wait = undefined;
});

describe('team vulnerability workload view', () => {
	it('loads only v0s with the selected environment, labels and server sort', async () => {
		await load(
			event(
				'?environment=dev&labels=owner%3Ateam&workloadSort=VULNERABILITY_UNIQUE_HIGH&workloadDirection=ASC&v0sWorkloadsAfter=next',
				true
			)
		);

		expect(loadV0s).toHaveBeenCalledWith(
			expect.objectContaining({
				blocking: true,
				variables: {
					team: 'example',
					environments: ['dev'],
					labels: [{ key: 'owner', value: 'team' }],
					orderBy: { field: 'VULNERABILITY_UNIQUE_HIGH', direction: 'ASC' },
					first: 20,
					after: 'next'
				}
			})
		);
		expect(loadSummary).not.toHaveBeenCalled();
		expect(loadSeverity).not.toHaveBeenCalled();
		expect(loadNoSbom).not.toHaveBeenCalled();
	});

	it('keeps the legacy team loader when v0s is disabled', async () => {
		await load(event());
		expect(loadSummary).toHaveBeenCalled();
		expect(loadV0s).not.toHaveBeenCalled();
	});

	it.each([
		{ totalCount: 0, message: 'No workloads match the selection.', showRows: false },
		{ totalCount: 5, message: 'No workloads on this page.', showRows: false },
		{ totalCount: 2, message: 'Threat signals', showRows: true }
	])('renders the workload table state: $message', async ({ totalCount, message, showRows }) => {
		const { TeamV0sOverviewStore } = await vi.importActual<typeof import('$houdini')>('$houdini');
		const store = new TeamV0sOverviewStore();
		const data: TeamV0sOverview$result = {
			team: {
				applications: { facets: null },
				jobs: { facets: null },
				environments: [],
				vulnerabilityFindings: {
					summary: {
						' $fragments': { V0sSelectionSummary: {} },
						countsBySeverity: { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 },
						knownExploitedVulnerabilityCount: 0,
						knownExploitedWorkloadCount: 0,
						coverage: {
							totalWorkloads: totalCount,
							scanned: 0,
							noSbom: 0,
							pending: totalCount,
							failed: 0,
							unresolvedImage: 0
						}
					}
				},
				workloads: {
					nodes: showRows
						? (['SCANNED', 'PENDING'] as const).map((status) => ({
								__typename: 'Application',
								id: status,
								name: status === 'SCANNED' ? 'api' : 'worker',
								team: { slug: 'example' },
								teamEnvironment: { environment: { name: 'dev' } },
								vulnerabilityOverview: {
									' $fragments': { V0sWorkloadOverview: {} },
									coverage: { status, error: null, scannedAt: null },
									knownExploitedVulnerabilityCount: 1,
									countsBySeverity: { critical: 3, high: 0, medium: 0, low: 0, unknown: 2 }
								}
							}))
						: [],
					pageInfo: {
						totalCount,
						hasPreviousPage: false,
						hasNextPage: totalCount > 0 && !showRows,
						pageStart: 0,
						pageEnd: 0,
						startCursor: null,
						endCursor: totalCount && !showRows ? 'next' : null
					}
				}
			}
		};
		const { body } = await render(TeamV0sWorkloads, {
			props: {
				store: Object.assign(store, writable({ ...get(store), data, fetching: false })),
				team: 'example',
				selection: { environmentName: null, labels: [] },
				orderBy: { field: 'NAME', direction: 'ASC' }
			}
		});
		expect(body).toContain(message);
		const dom = JSDOM.fragment(body);
		const next = dom.querySelector('nav[aria-label="Pagination"] a');
		if (showRows) {
			const rows = dom.querySelectorAll('tbody tr');
			expect(rows[0]?.querySelector('[role="img"][aria-label="Scanned"]')).not.toBeNull();
			expect(rows[0]?.querySelector('a.severity-badge.CRITICAL')?.getAttribute('href')).toBe(
				'/team/example/dev/app/api/vulnerabilities'
			);
			expect(rows[0]?.querySelector('a.severity-badge.UNASSIGNED')?.textContent?.trim()).toBe('2');
			expect(
				rows[0]?.querySelector('[aria-label="1 known exploited vulnerabilities"]')
			).not.toBeNull();
			expect(rows[1]?.querySelector('[role="img"][aria-label="Scan pending"]')).not.toBeNull();
			expect(rows[1]?.querySelector('a.severity-badge')).toBeNull();
			expect(rows[1]?.textContent).not.toContain('0');
		}
		if (totalCount > 0 && !showRows) {
			expect(body).not.toContain('No workloads match the selection.');
			expect(next?.getAttribute('href')).toBe(
				'/team/mango-panda/vulnerabilities?v0sWorkloadsAfter=next'
			);
		} else {
			expect(next).toBeNull();
		}
	});

	it('uses the same environment and labels for the v0s summary and workload selection', () => {
		const query = parse(readFileSync(new URL('./overview-v0s.gql', import.meta.url), 'utf8'));
		const operation = query.definitions.find((node) => node.kind === Kind.OPERATION_DEFINITION);
		const team = operation?.selectionSet.selections.find(
			(node) => node.kind === Kind.FIELD && node.name.value === 'team'
		);
		if (team?.kind !== Kind.FIELD) throw new Error('Missing team selection');
		const filter = (field: string, arg: string) => {
			const node = team.selectionSet?.selections.find(
				(selection) => selection.kind === Kind.FIELD && selection.name.value === field
			);
			return node?.kind === Kind.FIELD
				? node.arguments?.find(({ name }) => name.value === arg)?.value
				: undefined;
		};
		const workloadFilter = filter('workloads', 'filter');
		expect(workloadFilter).toMatchObject({
			kind: Kind.OBJECT,
			fields: [
				{
					name: { value: 'environments' },
					value: { kind: Kind.VARIABLE, name: { value: 'environments' } }
				},
				{ name: { value: 'labels' }, value: { kind: Kind.VARIABLE, name: { value: 'labels' } } }
			]
		});
		const summaryFilter = filter('vulnerabilityFindings', 'filter');
		if (!summaryFilter || !workloadFilter) throw new Error('Missing workload scope');
		expect(print(summaryFilter)).toBe(print(workloadFilter));
		const appFacetsFilter = filter('applications', 'filter');
		if (!appFacetsFilter) throw new Error('Missing application facet scope');
		expect(print(appFacetsFilter)).toBe(print(workloadFilter));
		const jobFacetsFilter = filter('jobs', 'filter');
		if (jobFacetsFilter?.kind !== Kind.OBJECT) throw new Error('Missing job facet scope');
		expect(
			print({
				...jobFacetsFilter,
				fields: jobFacetsFilter.fields.filter((f) => f.name.value !== 'name')
			})
		).toBe(print(workloadFilter));
	});
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
		const aggregate = team.selectionSet.selections.find(
			(selection) =>
				selection.kind === Kind.FIELD &&
				selection.name.value === 'vulnerabilitySummary' &&
				!selection.alias
		);
		if (aggregate?.kind !== Kind.FIELD) throw new Error('Missing vulnerability aggregate');
		expect(
			aggregate.arguments?.find((argument) => argument.name.value === 'filter')?.value
		).toMatchObject({
			kind: Kind.OBJECT,
			fields: [
				{
					name: { value: 'environmentName' },
					value: { kind: Kind.VARIABLE, name: { value: 'environmentName' } }
				},
				{
					name: { value: 'labels' },
					value: { kind: Kind.VARIABLE, name: { value: 'labels' } }
				}
			]
		});
		const teamSummary = team.selectionSet.selections.find(
			(selection) =>
				selection.kind === Kind.FIELD && selection.alias?.value === 'teamVulnerabilitySummary'
		);
		if (teamSummary?.kind !== Kind.FIELD) throw new Error('Missing team-wide SBOM context');
		expect(teamSummary.arguments?.length ?? 0).toBe(0);
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

	it('loads the ordinary list for old priority-view links while preserving filters', async () => {
		const result = await load(event('?view=priority&environment=dev&labels=owner%3Ateam'));

		expect(loadHigh).not.toHaveBeenCalled();
		expect(loadSeverity).toHaveBeenCalledOnce();
		expect(loadSeverity).toHaveBeenCalledWith(
			expect.objectContaining({
				blocking: true,
				variables: {
					team: 'example',
					environmentName: 'dev',
					labels: [{ key: 'owner', value: 'team' }],
					orderBy: { field: 'VULNERABILITY_SEVERITY_CRITICAL', direction: 'DESC' }
				}
			})
		);
		expect(result.selection).toEqual({
			environmentName: 'dev',
			labels: [{ key: 'owner', value: 'team' }]
		});
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
					orderBy: { field: 'NAME', direction: 'ASC' }
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

	it('keeps the team-wide no-SBOM count when vulnerability filters are selected', async () => {
		const { body } = await render(TeamVulnerabilityPage, {
			props: {
				params: { team: 'mango-panda' },
				data: {
					teamSlug: 'mango-panda',
					selection: {
						environmentName: 'dev-fss',
						labels: [{ key: 'owner', value: 'retired' }]
					},
					TeamVulnerabilities: writable({
						data: {
							team: {
								workloadsWithoutSbom: { pageInfo: { totalCount: 61 } },
								workloads: { pageInfo: { totalCount: 62 } },
								applications: { facets: { labels: [] } },
								jobs: { facets: { labels: [] } },
								teamVulnerabilitySummary: { sbomCount: 0 },
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
										totalCount: 62,
										hasNextPage: true,
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

		expect(body).toContain('No usable SBOMs are available for this team');
		expect(body).toContain('61 workloads have no');
		expect(body).toContain('<details>');
		expect(body).toContain('Workloads without usable SBOM (62)');
		expect(body).toContain('/team/mango-panda/dev-fss/app/polaris/vulnerabilities');
		expect(body).not.toContain('Workload Vulnerabilities');
	});

	it('identifies a workload when the team has no usable SBOM but no NO_SBOM status', async () => {
		const { body } = await render(TeamVulnerabilityPage, {
			props: {
				params: { team: 'mango-panda' },
				data: {
					teamSlug: 'mango-panda',
					selection: {
						environmentName: null,
						labels: []
					},
					TeamVulnerabilities: writable({
						data: {
							team: {
								workloadsWithoutSbom: { pageInfo: { totalCount: 0 } },
								workloads: { pageInfo: { totalCount: 1 } },
								applications: { facets: { labels: [] } },
								jobs: { facets: { labels: [] } },
								teamVulnerabilitySummary: { sbomCount: 0 },
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

	it('filters both vulnerability totals and rows while keeping missing-SBOM workloads team-wide', async () => {
		summary.missingSbomCount = 2;
		await load(event('?view=priority&environment=dev&labels=owner%3Ateam'));

		const labels = [{ key: 'owner', value: 'team' }];
		expect(loadSummary).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: { team: 'example', environmentName: 'dev', labels }
			})
		);
		expect(loadNoSbom).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: {
					team: 'example',
					first: 20,
					last: null,
					after: null,
					before: null,
					sbomStatus: 'NO_SBOM',
					orderBy: { field: 'NAME', direction: 'ASC' }
				}
			})
		);
		expect(loadSeverity).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					environmentName: 'dev',
					labels,
					orderBy: { field: 'VULNERABILITY_SEVERITY_CRITICAL', direction: 'DESC' }
				})
			})
		);
	});

	it('does not mistake an empty filtered selection for a team without usable SBOMs', async () => {
		summary.filteredSbomCount = 0;
		await load(event('?labels=absent'));

		expect(loadSeverity).toHaveBeenCalledOnce();
		expect(loadNoSbom).not.toHaveBeenCalled();
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

	it.each(['severity', 'priority'])(
		'forwards AND, existence and empty-value filters with standard ordering in %s view',
		async (view) => {
			const key = `${'a'.repeat(63)}.example.com/owner`;
			const params = new URLSearchParams({
				view,
				labels: `${key}:team,region,empty:`
			});
			await load(event(`?${params}`));

			expect(loadSummary).toHaveBeenCalledWith(
				expect.objectContaining({
					variables: expect.objectContaining({
						labels: [
							{ key, value: 'team' },
							{ key: 'region', value: undefined },
							{ key: 'empty', value: '' }
						]
					})
				})
			);
			expect(loadSeverity).toHaveBeenCalledOnce();
			expect(loadHigh).not.toHaveBeenCalled();
			expect(loadSeverity).toHaveBeenCalledWith(
				expect.objectContaining({
					blocking: true,
					variables: expect.objectContaining({
						labels: [
							{ key, value: 'team' },
							{ key: 'region', value: undefined },
							{ key: 'empty', value: '' }
						],
						orderBy: {
							field: 'VULNERABILITY_SEVERITY_CRITICAL',
							direction: 'DESC'
						}
					})
				})
			);
		}
	);

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
