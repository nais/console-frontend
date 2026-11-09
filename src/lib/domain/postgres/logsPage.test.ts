import { PostgresLogsStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
import Logs from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/logs/+page.svelte';

const fixture = vi.hoisted(() => ({
	clusterName: 'pg-database-main-f222277b' as string | null,
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
						postgres: {
							id: 'database',
							clusterName: fixture.clusterName
						}
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
		fixture.clusterName = 'pg-database-main-f222277b';
		fixture.fetching = false;
		fixture.errors = null;
	});

	test.each(['pg-database-main-f222277b', 'pg-database', 'custom-cluster-identity'])(
		'uses the full actual cluster %s without branch selection or pagination',
		async (clusterName) => {
			fixture.clusterName = clusterName;
			const { body } = await renderPage();
			expect(body).not.toContain('All branches');
			expect(body).not.toContain('Load more branches');
			expect(body).not.toContain('value="preview"');
			expect(LogExplorer).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({
					postgresClusterName: clusterName
				})
			);
			expect(vi.mocked(LogExplorer).mock.calls[0][1]).not.toHaveProperty('filters');
		}
	);

	test.each([null, ''])(
		'does not start a broad log search for unknown cluster %s',
		async (clusterName) => {
			fixture.clusterName = clusterName;
			const { body } = await renderPage();
			expect(body).toContain(
				'Logs are not available until the Postgres cluster identity is known.'
			);
			expect(body).not.toContain('Search log content');
			expect(LogExplorer).not.toHaveBeenCalled();
		}
	);

	test('surfaces GraphQL errors', async () => {
		fixture.errors = [{ message: 'Access denied' }];
		const { body } = await renderPage();
		expect(body).toContain('Access denied');
	});
});
