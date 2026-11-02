import {
	CVEWorkloadOrderField,
	TeamCVEPageStore,
	TeamCVEWorkloadsStore,
	type TeamCVEWorkloads$result
} from '$houdini';
import { page } from '$app/state';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { get, readable } from 'svelte/store';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TeamCvePage from './+page.svelte';

const { loadPage, loadWorkloads } = vi.hoisted(() => ({
	loadPage: vi.fn(async () => ({})),
	loadWorkloads: vi.fn(async () => ({}))
}));

vi.mock('$houdini', async (importOriginal) => {
	const { readable } = await import('svelte/store');
	return {
		...(await importOriginal<typeof import('$houdini')>()),
		graphql: () => ({}),
		fragment: (data: unknown) => readable(data),
		load_TeamCVEPage: loadPage,
		load_TeamCVEWorkloads: loadWorkloads
	};
});
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: vi.fn(async () => ({})) }));
vi.mock('$app/env', () => ({ browser: false, building: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/team/isa/vulnerabilities/CVE-2022-22965'),
		data: { tenantName: 'nais' }
	}
}));

import { load } from './+page';

type Finding = TeamCVEWorkloads$result['cve']['workloads']['edges'][number]['node'];

function finding(name: string, environment: string, vulnerabilityId = 'shared'): Finding {
	return {
		id: `${name}-${environment}`,
		workload: {
			__typename: 'Application',
			id: name,
			name,
			team: { slug: 'isa' },
			teamEnvironment: { environment: { name: environment } },
			image: { name: 'registry.example/app', tag: 'v1', digest: null }
		},
		vulnerability: {
			id: vulnerabilityId,
			identifier: 'CVE-2022-22965',
			severity: 'HIGH',
			package: 'pkg:maven/example@1.0',
			remediation: { fixVersion: '2.0', latestVersion: '3.0' },
			suppression: null
		}
	};
}

afterEach(() => vi.restoreAllMocks());

async function renderFindings(sort: string, nodes: Finding[], viewerIsMember = false) {
	page.url.search = `?sort=${sort}`;
	const details = new TeamCVEPageStore();
	const initialDetails = get(details);
	vi.spyOn(details, 'subscribe').mockImplementation(
		readable<typeof initialDetails>({
			...initialDetails,
			data: {
				cve: {
					id: 'cve',
					identifier: 'CVE-2022-22965',
					title: '',
					description: '',
					severity: 'HIGH',
					detailsLink: '',
					riskAssessment: {
						priority: 'MONITOR',
						cvssScore: null,
						hasKevEntry: false,
						knownRansomwareUse: false,
						epssScore: null,
						epssPercentile: null
					}
				},
				team: { viewerIsMember }
			}
		}).subscribe
	);
	const workloads = new TeamCVEWorkloadsStore();
	const initial = get(workloads);
	vi.spyOn(workloads, 'subscribe').mockImplementation(
		readable<typeof initial>({
			...initial,
			data: {
				cve: {
					id: 'cve',
					workloads: {
						impact: null,
						pageInfo: {
							totalCount: nodes.length,
							hasNextPage: false,
							hasPreviousPage: false,
							startCursor: null,
							endCursor: null
						},
						edges: nodes.map((node) => ({ node, cursor: node.id }))
					}
				}
			}
		}).subscribe
	);
	return render(TeamCvePage, {
		props: {
			params: { team: 'isa', cve: 'CVE-2022-22965' },
			data: {
				TeamCVEPage: details,
				TeamCVEWorkloads: workloads,
				teamSlug: 'isa',
				cveIdentifier: 'CVE-2022-22965',
				rows: 25
			} as ComponentProps<typeof TeamCvePage>['data']
		}
	});
}

describe('team CVE grouping', () => {
	it.each([
		['WORKLOAD-ASC', [finding('alpha', 'dev'), finding('beta', 'dev')], ['alpha', 'beta']],
		['WORKLOAD-DESC', [finding('beta', 'dev'), finding('alpha', 'dev')], ['beta', 'alpha']],
		['ENVIRONMENT-ASC', [finding('alpha', 'dev'), finding('beta', 'prod')], ['dev', 'prod']],
		['PACKAGE-ASC', [finding('alpha', 'dev'), finding('beta', 'prod')], ['pkg:maven/example@1.0']]
	] as const)(
		'groups %s by the selected field while preserving API order',
		async (sort, nodes, expected) => {
			const { body } = await renderFindings(sort, [...nodes]);
			const headings = [...body.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g)].map(([, text]) =>
				text.replace(/<!--[\s\S]*?-->/g, '').trim()
			);
			expect(headings).toEqual(expected);
			expect(body).toContain('alpha');
			expect(body).toContain('beta');
			expect(body).toContain('pkg:maven/example@1.0');
		}
	);

	it('keeps distinct vulnerabilities visible within a selected workload group', async () => {
		const first = finding('alpha', 'dev', 'first');
		const second = finding('alpha', 'prod', 'second');
		const { body } = await renderFindings('WORKLOAD-ASC', [first, second]);
		expect([...body.matchAll(/<h3\b/g)]).toHaveLength(1);
		expect(body).toContain('/team/isa/dev/app/alpha');
		expect(body).toContain('/team/isa/prod/app/alpha');
	});

	it('renders one flat row per finding with its own image and remediation', async () => {
		const first = finding('alpha', 'dev');
		const other = finding('beta', 'prod');
		if (other.workload.__typename !== 'Application') throw new Error('Expected application');
		const second: Finding = {
			...other,
			workload: {
				...other.workload,
				image: { name: 'registry.example/other', tag: 'v2', digest: null }
			},
			vulnerability: {
				...other.vulnerability,
				remediation: { fixVersion: '4.0', latestVersion: '5.0' }
			}
		};
		const { body } = await renderFindings('PACKAGE-ASC', [first, second]);
		const rows = body.split(/class="workload-container\b[^"]*"/).slice(1);
		expect(rows).toHaveLength(2);
		expect(rows[0]).toContain('/team/isa/dev/app/alpha');
		expect(rows[0]).toContain('registry.example/app:v1');
		expect(rows[0]).toContain('2.0');
		expect(rows[1]).toContain('/team/isa/prod/app/beta');
		expect(rows[1]).toContain('registry.example/other:v2');
		expect(rows[1]).toContain('4.0');
	});

	it.each([true, false])(
		'keeps suppression checkboxes restricted to team members: %s',
		async (member) => {
			const active = finding('alpha', 'dev');
			const suppressed = {
				...finding('beta', 'prod', 'suppressed'),
				vulnerability: {
					...finding('beta', 'prod', 'suppressed').vulnerability,
					suppression: { state: 'FALSE_POSITIVE' as const }
				}
			};
			const { body } = await renderFindings('WORKLOAD-ASC', [active, suppressed], member);
			const checkboxes = [...body.matchAll(/<input\b[^>]*type="checkbox"[^>]*>/g)].map(
				([input]) => input
			);
			expect(checkboxes).toHaveLength(member ? 3 : 0);
			if (member) {
				const rows = body.split(/class="workload-container\b[^"]*"/).slice(1);
				expect(rows[0]).not.toContain('aksel-checkbox--readonly');
				expect(rows[1]).toContain('aksel-checkbox--readonly');
				expect(rows[1]).toContain('aksel-checkbox--disabled');
				expect(body).toContain('Select all for this team');
				expect(body).toContain('Select all workloads with package');
			}
		}
	);

	it.each(Object.values(CVEWorkloadOrderField))(
		'loads %s ordering without dropping the team filter',
		async (field) => {
			for (const direction of ['ASC', 'DESC']) {
				const url = new URL(
					`https://console.example.com/team/isa/vulnerabilities/CVE-2022-22965?sort=${field}-${direction}`
				);
				await load({
					params: { team: 'isa', cve: 'CVE-2022-22965' },
					url
				} as Parameters<typeof load>[0]);
				expect(loadWorkloads).toHaveBeenLastCalledWith({
					event: expect.anything(),
					variables: {
						identifier: 'CVE-2022-22965',
						first: 25,
						filter: { teamSlugs: ['isa'] },
						orderBy: { field, direction }
					}
				});
			}
		}
	);
});
