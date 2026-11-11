import { PostgresLogsStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
import Logs from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/logs/+page.svelte';

const fixture = vi.hoisted(() => ({
	postgres: { id: 'opaque-postgres-id' } as { id: string } | null,
	fetching: false,
	errors: null as { message: string }[] | null
}));

vi.mock('$app/state', () => ({
	page: {
		params: { team: 'test', env: 'dev', postgres: 'database' },
		data: { tenantName: 'nav' },
		url: new URL('https://console.test/?branch=main')
	}
}));
vi.mock('#lib/domain/logs/LogExplorer.svelte', () => ({ default: vi.fn() }));
vi.mock('$houdini', () => ({
	PostgresLogsStore: class {
		subscribe = readable({
			data: {
				team: {
					environment: {
						postgres: fixture.postgres
					}
				}
			},
			fetching: fixture.fetching,
			errors: fixture.errors
		}).subscribe;
	}
}));

function renderPage() {
	return render(Logs, {
		props: {
			params: { team: 'test', env: 'dev', postgres: 'database' },
			data: { PostgresLogs: new PostgresLogsStore() } as ComponentProps<typeof Logs>['data']
		}
	});
}

describe('Postgres logs page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		fixture.postgres = { id: 'opaque-postgres-id' };
		fixture.fetching = false;
		fixture.errors = null;
	});

	test.each(['opaque-postgres-id', 'another-postgres-id'])(
		'passes logical Postgres ID %s without requiring a physical cluster identity',
		async (id) => {
			fixture.postgres = { id };
			const { body } = await renderPage();
			expect(body).not.toContain('All branches');
			expect(body).not.toContain('Load more branches');
			expect(body).not.toContain('value="preview"');
			expect(LogExplorer).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					postgresId: id,
					team: 'test',
					environment: 'dev',
					workload: 'database',
					container: 'postgres'
				})
			);
			expect(vi.mocked(LogExplorer).mock.calls[0][1]).not.toHaveProperty('filters');
			expect(vi.mocked(LogExplorer).mock.calls[0][1]).not.toHaveProperty('postgresClusterName');
		}
	);

	test('does not render the explorer when Postgres is missing', async () => {
		fixture.postgres = null;
		await renderPage();
		expect(LogExplorer).not.toHaveBeenCalled();
	});

	test('shows loading while resolving Postgres', async () => {
		fixture.postgres = null;
		fixture.fetching = true;
		const { body } = await renderPage();
		expect(body).toContain('aria-label="Loading"');
		expect(LogExplorer).not.toHaveBeenCalled();
	});

	test('surfaces GraphQL errors', async () => {
		fixture.errors = [{ message: 'Access denied' }];
		const { body } = await renderPage();
		expect(body).toContain('Access denied');
	});
});
