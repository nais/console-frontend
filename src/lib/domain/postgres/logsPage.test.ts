import { PostgresLogsStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import LogExplorer from '#lib/domain/logs/LogExplorer.svelte';
import Logs from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/logs/+page.svelte';

const fixture = vi.hoisted(() => ({
	activeBranch: { id: 'main', name: 'main' } as { id: string; name: string } | null,
	fetching: false,
	errors: null as { message: string }[] | null
}));

vi.mock('$app/state', () => ({
	page: {
		params: { team: 'test', env: 'dev', postgres: 'database' },
		data: { tenantName: 'nav' },
		url: new URL('https://console.test/?branch=preview')
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
							activeBranch: fixture.activeBranch,
							branches: {
								nodes: [{ id: 'preview', name: 'preview' }],
								pageInfo: { hasNextPage: true }
							}
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
		fixture.activeBranch = { id: 'main', name: 'main' };
		fixture.fetching = false;
		fixture.errors = null;
	});

	test('uses only the active branch and removes branch selection and pagination', async () => {
		const { body } = await renderPage();
		expect(body).not.toContain('All branches');
		expect(body).not.toContain('Load more branches');
		expect(body).not.toContain('value="preview"');
		expect(LogExplorer).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				podNamePrefix: 'pg-database-main-',
				exactPostgresBranch: true
			})
		);
		expect(vi.mocked(LogExplorer).mock.calls[0][1]).not.toHaveProperty('filters');
	});

	test('does not query another branch or all branches when no branch is active', async () => {
		fixture.activeBranch = null;
		const { body } = await renderPage();
		expect(body).toContain('Logs are not available until Postgres has an active branch.');
		expect(body).not.toContain('Search log content');
		expect(LogExplorer).not.toHaveBeenCalled();
	});

	test('surfaces GraphQL errors', async () => {
		fixture.errors = [{ message: 'Access denied' }];
		const { body } = await renderPage();
		expect(body).toContain('Access denied');
	});
});
