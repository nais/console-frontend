import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import { ApplicationsStore, JobsStore } from '$houdini';
import ApplicationsPage from '../../../routes/team/[team]/applications/+page.svelte';
import JobsPage from '../../../routes/team/[team]/jobs/+page.svelte';

const mockedPage = vi.hoisted(() => ({
	url: new URL('https://console.example.com/team/test/applications')
}));

vi.mock('$app/state', () => ({ page: mockedPage }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$houdini', () => ({
	ApplicationOrderField: { NAME: 'NAME', ISSUES: 'ISSUES' },
	JobOrderField: { NAME: 'NAME', ISSUES: 'ISSUES' },
	OrderDirection: { ASC: 'ASC', DESC: 'DESC' },
	JobState: { RUNNING: 'RUNNING', COMPLETED: 'COMPLETED', FAILED: 'FAILED' },
	ApplicationsStore: class {
		subscribe = emptyStore('applications').subscribe;
	},
	JobsStore: class {
		subscribe = emptyStore('jobs').subscribe;
	}
}));

function emptyConnection() {
	return {
		edges: [],
		pageInfo: { totalCount: 0 },
		facets: { states: [], environments: [], labels: [] }
	};
}

function emptyStore(resource: 'applications' | 'jobs') {
	return readable({
		data: { team: { [resource]: emptyConnection() } },
		errors: null,
		fetching: false,
		variables: { filter: { name: mockedPage.url.searchParams.get('filter') ?? '' } }
	});
}

describe.each(['applications', 'jobs'] as const)('%s empty state', (resource) => {
	test.each([false, true])(
		'keeps the filter toggle accessible with active filters=%s',
		async (filtered) => {
			mockedPage.url = new URL(
				`https://console.example.com/team/test/${resource}${filtered ? '?filter=no-match' : ''}`
			);
			const { body } =
				resource === 'applications'
					? await render(ApplicationsPage, {
							props: {
								params: { team: 'test' },
								data: { Applications: new ApplicationsStore() } as ComponentProps<
									typeof ApplicationsPage
								>['data']
							}
						})
					: await render(JobsPage, {
							props: {
								params: { team: 'test' },
								data: { Jobs: new JobsStore() } as ComponentProps<typeof JobsPage>['data']
							}
						});

			expect(body).toMatch(/<button[^>]*class="sidebar-toggle"[^>]*aria-expanded="false"/);
			expect(body).toContain(
				filtered ? `No ${resource} match your filters.` : `No ${resource} found.`
			);
			expect(body).not.toContain('<table');
			expect(body).not.toContain('table-scroll');
			expect(body).toContain(resource === 'applications' ? 'Search applications' : 'Search jobs');
		}
	);
});
