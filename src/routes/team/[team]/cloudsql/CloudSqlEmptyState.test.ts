import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import { SqlInstancesStore } from '$houdini';
import CloudSqlPage from './+page.svelte';

const state = vi.hoisted(() => ({
	populated: false,
	hasData: true,
	fetching: false,
	errors: null as { message: string }[] | null
}));

vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/team/test/cloudsql'),
		params: { team: 'test' }
	}
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('#lib/doc.js', () => ({
	docURL: (path: string) => new URL(path, 'https://docs.nais.io').href
}));
vi.mock('$houdini', () => ({
	OrderDirection: { ASC: 'ASC', DESC: 'DESC' },
	SqlInstanceOrderField: {
		NAME: 'NAME',
		ENVIRONMENT: 'ENVIRONMENT',
		ISSUES: 'ISSUES',
		STATE: 'STATE',
		VERSION: 'VERSION'
	},
	SqlInstancesStore: class {
		subscribe = queryStore().subscribe;
	}
}));

function queryStore() {
	return readable({
		fetching: state.fetching,
		errors: state.errors,
		data: state.hasData
			? {
					team: {
						sqlInstances: {
							pageInfo: {
								totalCount: state.populated ? 1 : 0,
								hasNextPage: false,
								hasPreviousPage: false,
								pageStart: state.populated ? 1 : 0,
								pageEnd: state.populated ? 1 : 0,
								startCursor: null,
								endCursor: null
							},
							edges: state.populated
								? [
										{
											node: {
												id: 'instance-1',
												name: 'example-db',
												state: 'RUNNABLE',
												version: 'POSTGRES_17',
												team: { slug: 'test' },
												teamEnvironment: { environment: { name: 'prod' } },
												issues: { pageInfo: { totalCount: 0 }, edges: [] },
												workload: null
											}
										}
									]
								: []
						}
					}
				}
			: null
	});
}

async function renderPage() {
	return render(CloudSqlPage, {
		props: {
			params: { team: 'test' },
			data: { SqlInstances: new SqlInstancesStore() } as ComponentProps<typeof CloudSqlPage>['data']
		}
	});
}

beforeEach(() => {
	state.populated = false;
	state.hasData = true;
	state.fetching = false;
	state.errors = null;
});

test('renders a structured empty state outside a table with its documentation link', async () => {
	const { body } = await renderPage();
	expect(body).toMatch(/<h2[^>]*>[\s\S]*?Cloud SQL[\s\S]*?<\/h2>/);
	expect(body).toMatch(/<h3[^>]*>[\s\S]*?No Cloud SQL instances found\.[\s\S]*?<\/h3>/);
	expect(body).toContain('Cloud SQL instances provide managed relational databases in the cloud.');
	expect(body).toContain('href="https://docs.nais.io/persistence/cloudsql"');
	expect(body).not.toContain('<table');
	expect(body).not.toContain('table-scroll');
});

test('keeps populated collections as resource tables', async () => {
	state.populated = true;
	const { body } = await renderPage();
	expect(body).toContain('<table');
	expect(body).toContain('example-db');
	expect(body).not.toContain('No Cloud SQL instances found.');
});

test('does not show an empty state while loading', async () => {
	state.fetching = true;
	state.hasData = false;
	const { body } = await renderPage();
	expect(body).toContain('aria-label="Loading"');
	expect(body).not.toContain('No Cloud SQL instances found.');
});

test('preserves query errors instead of presenting them as an empty collection', async () => {
	state.hasData = false;
	state.errors = [{ message: 'Unable to load Cloud SQL instances' }];
	const { body } = await renderPage();
	expect(body).toContain('Unable to load Cloud SQL instances');
	expect(body).not.toContain('No Cloud SQL instances found.');
});
