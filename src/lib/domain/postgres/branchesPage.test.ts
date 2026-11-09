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
	])('keeps branch management read-only for permissions %j', async (permissions) => {
		const { body } = await renderPage(permissions);
		expect(body).not.toContain('Create branch');
		expect(body).not.toContain('Create child branch');
		expect(body).not.toContain('Branch name');
		expect(body).not.toContain('Restore to (UTC)');
		expect(body).not.toContain('Use as active');
		expect(body).not.toContain('Switch active branch');
		expect(body).not.toContain('Delete branch');
		expect(body).not.toContain('aria-label="Actions for');
		expect(body).toContain('Branch management is no longer available in Console.');
		expect(graphql).not.toHaveBeenCalled();
	});

	test.each([{ viewerIsMember: true }, { isAdmin: true }])(
		'preserves the branch overview without management actions for %j',
		async (permissions) => {
			const { body } = await renderPage(permissions);
			expect(body).toContain('Branches (2)');
			expect(body).toContain('preview');
			expect(body).not.toContain('aria-label="Actions for');
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
