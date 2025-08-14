import type { UserInfo$result } from '$houdini';
import { error } from '@sveltejs/kit';
import { get, type Readable } from 'svelte/store';

export async function load({ parent }) {
	const pd = await parent();

	const userInfo = get(
		pd.UserInfo as Readable<{
			data?: UserInfo$result | null;
		}>
	);

	if (!(userInfo.data?.me.__typename === 'User' && userInfo.data?.me.isAdmin)) {
		error(403, 'You are not allowed to view this page');
	}
}
