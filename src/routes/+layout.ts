import { load_AdminReconcilerStatus, load_UserInfo, AdminReconcilerStatusStore } from '$houdini';
import { loadRemainingReconcilerPages } from '#lib/reconcilerStatus.js';
import { get } from 'svelte/store';

export async function load(event) {
	const userInfo = await load_UserInfo({ event, blocking: true });

	let isAdmin = false;

	const ui = get(userInfo.UserInfo);
	if (ui.data?.me.__typename === 'User' && ui.data?.me.isAdmin) {
		isAdmin = true;
	}

	let AdminReconcilerStatus: AdminReconcilerStatusStore | null = null;
	let reconcilerStatusError: string | null = null;
	if (isAdmin) {
		try {
			({ AdminReconcilerStatus } = await load_AdminReconcilerStatus({ event, blocking: true }));
			await loadRemainingReconcilerPages(AdminReconcilerStatus, event.fetch);
		} catch (error) {
			AdminReconcilerStatus ??= new AdminReconcilerStatusStore();
			console.error('Unable to load reconciler status:', error);
			reconcilerStatusError = 'Unable to load reconciler status. Try refreshing the page.';
		}
	}

	return {
		isAdmin,
		AdminReconcilerStatus,
		reconcilerStatusError,
		// Ensure the meta is always available to avoid undefined errors
		meta: {},
		...event.data,
		...userInfo
	};
}
