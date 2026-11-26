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
		state: string;
		teamEnvironment: { environment: { name: string } };
	}[],
	backups: [] as {
		id: string;
		name: string;
		sourcePostgres: string;
		phase: string;
		retentionDays: number;
		majorVersion: string | null;
		diskSize: string | null;
		extensions: string[];
		sizeBytes: number | null;
		createdAt: Date;
		completedAt: Date | null;
		expiresAt: Date | null;
		errorMessage: string | null;
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
vi.mock('$app/navigation', () => ({ goto: vi.fn(), afterNavigate: vi.fn() }));
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
					},
					postgresBackups: {
						pageInfo: { totalCount: fixture.backups.length },
						nodes: fixture.backups
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
		['AVAILABLE', 'success', 'available'],
		['DEGRADED', 'danger', 'degraded'],
		['PROGRESSING', 'warning', 'progressing']
	])('shows Postgres state=%s', async (state, tone, label) => {
		fixture.nodes = [
			{
				id: 'database',
				name: 'database',
				majorVersion: '18',
				state,
				teamEnvironment: { environment: { name: 'dev-gcp' } }
			}
		];
		const { body } = await renderPage();

		expect(body).toContain('status-column');
		expect(body).toMatch(/role="region" aria-label="Postgres" tabindex="0"/);
		expect(body).toMatch(
			new RegExp(`class="status-indicator ${tone}[^"]*" role="img" aria-label="${label}"`)
		);
		expect(body).toContain('/team/test/dev-gcp/postgres/database');
	});

	test('renders guidance without a table when no databases exist', async () => {
		fixture.nodes = [];
		fixture.backups = [];
		const { body } = await renderPage();

		expect(body).not.toContain('<table');
		expect(body).toContain('No Postgres found.');
		expect(body).toContain('sidebar-toggle');
	});

	test('renders standalone backups even after their source database is deleted', async () => {
		fixture.nodes = [];
		fixture.backups = [
			{
				id: 'backup-1',
				name: 'frogres-dr-1',
				sourcePostgres: 'deleted-db',
				phase: 'COMPLETED',
				retentionDays: 30,
				majorVersion: '18',
				diskSize: '10Gi',
				extensions: [],
				sizeBytes: 115250090,
				createdAt: new Date('2026-11-25T10:47:22Z'),
				completedAt: new Date('2026-11-25T10:47:57Z'),
				expiresAt: new Date('2026-12-25T10:47:57Z'),
				errorMessage: null,
				teamEnvironment: { environment: { name: 'dev-gcp' } }
			}
		];
		const { body } = await renderPage();

		expect(body).toContain('frogres-dr-1');
		expect(body).toContain('deleted-db');
		expect(body).toContain('110 MiB');
		expect(body).toContain('25 Dec 2026');
	});
});
