import { load_UserInfo } from '$houdini';
import { get } from 'svelte/store';

export async function load(event) {
	const userInfo = await load_UserInfo({ event, blocking: true });

	let isAdmin = false;

	const ui = get(userInfo.UserInfo);
	if (ui.data?.me.__typename === 'User' && ui.data?.me.isAdmin) {
		isAdmin = true;
	}

	return {
		isAdmin,
		// Ensure the meta is always available to avoid undefined errors
		meta: {},
		...event.data,
		...userInfo
	};
}
