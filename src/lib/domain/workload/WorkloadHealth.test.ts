import {
	AppHealthV0sStore,
	JobHealthV0sStore,
	WorkloadHealthCostStore,
	WorkloadHealthJobCostStore
} from '$houdini';
import { JSDOM } from 'jsdom';
import { render } from 'svelte/server';
import { get, readable } from 'svelte/store';
import WorkloadHealth from './WorkloadHealth.svelte';

vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$houdini', async (importOriginal) => {
	const houdini = await importOriginal<typeof import('$houdini')>();
	const stores = {
		WorkloadHealthCost: houdini.WorkloadHealthCostStore,
		WorkloadHealthJobCost: houdini.WorkloadHealthJobCostStore,
		WorkloadHealthVulnerabilities: houdini.WorkloadHealthVulnerabilitiesStore,
		WorkloadHealthJobVulnerabilities: houdini.WorkloadHealthJobVulnerabilitiesStore
	};
	return {
		...houdini,
		graphql: (query: string) => {
			const name = Object.keys(stores).find((name) => query.includes(`query ${name}(`));
			if (!name) throw new Error('Unexpected health query');
			return new stores[name as keyof typeof stores]();
		}
	};
});

afterEach(() => vi.restoreAllMocks());

test.each(['app', 'job'] as const)(
	'renders %s health once v0s and cost data are ready without fetching legacy vulnerabilities',
	async (workloadType) => {
		const cost = {
			daily: {
				series: [
					{ date: new Date('2026-11-01'), sum: 10 },
					{ date: new Date('2026-11-02'), sum: 12 }
				]
			}
		};
		if (workloadType === 'app') {
			const initial = get(new WorkloadHealthCostStore());
			vi.spyOn(WorkloadHealthCostStore.prototype, 'subscribe').mockImplementation(
				readable({
					...initial,
					fetching: false,
					data: { team: { environment: { application: { cost } } } }
				}).subscribe
			);
		} else {
			const initial = get(new WorkloadHealthJobCostStore());
			vi.spyOn(WorkloadHealthJobCostStore.prototype, 'subscribe').mockImplementation(
				readable({
					...initial,
					fetching: false,
					data: { team: { environment: { job: { cost } } } }
				}).subscribe
			);
		}

		const store = workloadType === 'app' ? new AppHealthV0sStore() : new JobHealthV0sStore();
		const v0sHealth = Object.assign(
			store,
			readable({
				...(store instanceof AppHealthV0sStore ? get(store) : get(store)),
				fetching: false,
				data: {
					team: {
						environment: {
							workload: {
								vulnerabilityOverview: {
									knownExploitedVulnerabilityCount: 3,
									coverage: { status: 'SCANNED' as const, error: null }
								}
							}
						}
					}
				}
			})
		);
		const { body } = await render(WorkloadHealth, {
			props: {
				teamSlug: 'example',
				environment: 'dev',
				workload: 'worker',
				workloadType,
				v0sHealth
			}
		});
		const card = JSDOM.fragment(body);
		const vulnerabilityMetric = card.querySelector(
			`a[href="/team/example/dev/${workloadType}/worker/vulnerabilities"]`
		);
		expect(vulnerabilityMetric?.textContent?.replace(/\s+/g, ' ').trim()).toBe('3 Known exploited');
		expect(card.textContent).toContain('Cost vs last month');
	}
);
