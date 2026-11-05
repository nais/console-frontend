import {
	AdminReconcilerStatusStore,
	UserInfoStore,
	load_AdminReconcilerStatus,
	load_UserInfo
} from '$houdini';
import { get, readable } from 'svelte/store';
import { vi } from 'vitest';
import { load } from './+layout.js';

vi.mock('$app/env', () => ({ browser: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$houdini', async (importOriginal) => ({
	...(await importOriginal<typeof import('$houdini')>()),
	load_UserInfo: vi.fn(),
	load_AdminReconcilerStatus: vi.fn()
}));

const event = {
	data: {
		tenantName: 'test',
		githubOrganization: 'test',
		theme: 'light',
		userAgent: ''
	},
	url: new URL('http://localhost/'),
	fetch: globalThis.fetch
} as Parameters<typeof load>[0];

beforeEach(() => {
	vi.clearAllMocks();
});

function userInfo(isAdmin: boolean, typename = 'User') {
	const store = new UserInfoStore();
	return Object.assign(
		store,
		readable({ ...get(store), data: { me: { __typename: typename, isAdmin } } })
	);
}

test.each([
	[false, 'User'],
	[true, 'ServiceAccount']
])('does not request reconciler status for %s / %s', async (isAdmin, typename) => {
	vi.mocked(load_UserInfo).mockResolvedValue({ UserInfo: userInfo(isAdmin, typename) });

	const result = await load(event);

	expect(load_AdminReconcilerStatus).not.toHaveBeenCalled();
	expect(result.AdminReconcilerStatus).toBeNull();
	expect(result.reconcilerStatusError).toBeNull();
});

test('loads reconciler status for administrators during the root load', async () => {
	const store = new AdminReconcilerStatusStore();
	vi.mocked(load_UserInfo).mockResolvedValue({ UserInfo: userInfo(true) });
	vi.mocked(load_AdminReconcilerStatus).mockResolvedValue({ AdminReconcilerStatus: store });

	const result = await load(event);

	expect(load_AdminReconcilerStatus).toHaveBeenCalledExactlyOnceWith({ event, blocking: true });
	expect(result.AdminReconcilerStatus).toBe(store);
	expect(result.isAdmin).toBe(true);
});

test('reports an unavailable status without failing the entire page', async () => {
	const error = new Error('Connection failed');
	const log = vi.spyOn(console, 'error').mockImplementation(() => {});
	vi.mocked(load_UserInfo).mockResolvedValue({ UserInfo: userInfo(true) });
	vi.mocked(load_AdminReconcilerStatus).mockRejectedValue(error);

	try {
		const result = await load(event);
		expect(result.reconcilerStatusError).toBe(
			'Unable to load reconciler status. Try refreshing the page.'
		);
		expect(result.AdminReconcilerStatus).toBeInstanceOf(AdminReconcilerStatusStore);
		expect(log).toHaveBeenCalledWith('Unable to load reconciler status:', error);
	} finally {
		log.mockRestore();
	}
});
