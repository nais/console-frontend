import { graphql, PostgresBranchesStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import Branches from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/branches/+page.svelte';

const fixture = vi.hoisted(() => ({ branches: {} }));

vi.mock('$app/state', () => ({
	page: { params: { team: 'test', env: 'dev', postgres: 'database' } }
}));
vi.mock('$houdini', () => ({
	graphql: vi.fn(() => ({ mutate: vi.fn() })),
	PostgresBranchesStore: class {
		subscribe = readable(fixture.branches).subscribe;
	}
}));

function branch(name: string) {
	return {
		id: name,
		name,
		state: 'AVAILABLE',
		createdAt: new Date('2026-11-01T10:00:00Z'),
		workloads: { nodes: [], pageInfo: { totalCount: 0 } }
	};
}

async function renderPage({
	viewerIsMember = false,
	isAdmin = false,
	nodes = [branch('main'), branch('preview')],
	hasNextPage = false
} = {}) {
	fixture.branches = {
		errors: null,
		fetching: false,
		data: {
			team: {
				environment: {
					postgres: {
						id: 'database',
						name: 'database',
						activeBranch: branch('main'),
						desiredActiveBranch: 'main',
						branches: { nodes, pageInfo: { hasNextPage } }
					}
				}
			}
		}
	};
	return render(Branches, {
		props: {
			data: {
				viewerIsMember,
				isAdmin,
				PostgresBranches: new PostgresBranchesStore()
			} as ComponentProps<typeof Branches>['data'],
			params: { team: 'test', env: 'dev', postgres: 'database' }
		}
	});
}

describe('Postgres branches page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test.each([
		{ viewerIsMember: true, isAdmin: false },
		{ viewerIsMember: false, isAdmin: true },
		{ viewerIsMember: false, isAdmin: false }
	])('removes branch creation for permissions %j', async (permissions) => {
		const { body } = await renderPage(permissions);
		expect(body).not.toContain('Create branch');
		expect(body).not.toContain('Create child branch');
		expect(body).not.toContain('Branch name');
		expect(body).not.toContain('Restore to (UTC)');
		expect(body).toContain('Creating new branches is no longer available in Console.');
		const operations = vi.mocked(graphql).mock.calls.map(([document]) => document);
		expect(operations).toHaveLength(2);
		expect(operations[0]).toContain('mutation ActivatePostgresBranch');
		expect(operations[1]).toContain('mutation DeletePostgresBranch');
	});

	test.each([{ viewerIsMember: true }, { isAdmin: true }])(
		'preserves existing branch management without an empty active-branch menu for %j',
		async (permissions) => {
			const { body } = await renderPage(permissions);
			expect(body).toContain('Branches (2)');
			expect(body).toContain('preview');
			expect(body).toContain('aria-label="Actions for preview"');
			expect(body).not.toContain('aria-label="Actions for main"');
		}
	);

	test('does not expose management actions to non-members', async () => {
		const { body } = await renderPage();
		expect(body).not.toContain('aria-label="Actions for');
		expect(body).toContain('preview');
	});

	test('preserves pagination and avoids duplicating the active branch', async () => {
		const { body } = await renderPage({ hasNextPage: true });
		expect(body).toContain('Branches (2+)');
		expect(body).toContain('Load more');
		expect(body.match(/<strong\b[^>]*>main<\/strong>/g)).toHaveLength(1);
	});
});
