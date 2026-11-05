import { AdminReconcilerStatusStore, UserInfoStore } from '$houdini';
import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { get, readable } from 'svelte/store';
import { vi } from 'vitest';
import type { LayoutProps } from './$types';
import AdminLayout from './+layout.svelte';

vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$app/env', () => ({ browser: false, dev: false }));
vi.mock('$app/paths', () => ({ resolve: (path: string) => path }));

vi.mock('$app/state', () => ({
	page: {
		url: new URL('http://localhost/admin'),
		params: {},
		route: { id: '/admin' },
		data: { meta: { title: 'Administration' } }
	}
}));

function data(totalCount: number): LayoutProps['data'] {
	const store = new AdminReconcilerStatusStore();
	return {
		tenantName: 'test',
		githubOrganization: 'test',
		theme: 'light',
		userAgent: '',
		isAdmin: true,
		UserInfo: new UserInfoStore(),
		AdminReconcilerStatus: Object.assign(
			store,
			readable({
				...get(store),
				data: {
					reconcilers: {
						edges: [{ cursor: 'one', node: { id: 'one', errors: { pageInfo: { totalCount } } } }],
						pageInfo: {
							hasNextPage: false,
							hasPreviousPage: false,
							startCursor: 'one',
							endCursor: 'one'
						}
					}
				}
			})
		),
		reconcilerStatusError: null,
		meta: {}
	};
}

test.each([0, 65])(
	'shows the error indicator only on the Reconcilers tab (%i errors)',
	async (count) => {
		const { body } = await render(AdminLayout, {
			props: {
				data: data(count),
				params: {},
				children: createRawSnippet(() => ({ render: () => '<div></div>' }))
			}
		});
		const reconcilerLink = body.match(/<a[^>]*href="\/admin\/reconcilers"[\s\S]*?<\/a>/)?.[0];
		expect(reconcilerLink).toBeDefined();
		if (count > 0) {
			expect(reconcilerLink).toContain('aria-label="Reconcilers have errors"');
			expect(body.match(/aria-label="Reconcilers have errors"/g)).toHaveLength(1);
		} else {
			expect(body).not.toContain('aria-label="Reconcilers have errors"');
		}
	}
);
