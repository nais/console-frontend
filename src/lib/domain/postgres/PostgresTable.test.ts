import { TeamPostgresStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import PostgresPage from '../../../routes/team/[team]/postgres/+page.svelte';

const fixture = vi.hoisted(() => ({
	nodes: [] as {
		id: string;
		name: string;
		majorVersion: string;
		desiredActiveBranch: string | null;
		activeBranch: { name: string; state: string } | null;
		teamEnvironment: { environment: { name: string } };
	}[]
}));

vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/team/test/postgres'),
		data: { tenantName: 'nav' },
		params: { team: 'test' }
	}
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$houdini', () => ({
	TeamPostgresStore: class {
		subscribe = readable({
			data: {
				team: {
					environments: [],
					postgreses: {
						edges: fixture.nodes.map((node) => ({ node })),
						pageInfo: { totalCount: fixture.nodes.length },
						facets: { labels: [] }
					}
				}
			},
			errors: null,
			fetching: false
		}).subscribe;
	}
}));

async function renderPage() {
	return render(PostgresPage, {
		props: {
			params: { team: 'test' },
			data: { TeamPostgres: new TeamPostgresStore() } as ComponentProps<typeof PostgresPage>['data']
		}
	});
}

describe('Postgres table', () => {
	test.each([
		['AVAILABLE', 'main', 'main', 'success', 'available'],
		['DEGRADED', 'main', 'main', 'danger', 'degraded'],
		['AVAILABLE', 'main', 'next', 'warning', 'progressing'],
		[null, null, null, 'warning', 'progressing']
	])('shows state=%s active=%s desired=%s', async (state, active, desired, tone, label) => {
		fixture.nodes = [
			{
				id: 'database',
				name: 'database',
				majorVersion: '18',
				activeBranch: state && active ? { name: active, state } : null,
				desiredActiveBranch: desired,
				teamEnvironment: { environment: { name: 'dev-gcp' } }
			}
		];
		const { body } = await renderPage();

		expect(body).toContain('status-column');
		expect(body).toMatch(
			new RegExp(`class="status-indicator ${tone}[^"]*" role="img" aria-label="${label}"`)
		);
		expect(body).toContain('/team/test/dev-gcp/postgres/database');
	});

	test('renders guidance without a table when no databases exist', async () => {
		fixture.nodes = [];
		const { body } = await renderPage();

		expect(body).not.toContain('<table');
		expect(body).toContain('No Postgres found.');
		expect(body).toContain('sidebar-toggle');
	});
});
