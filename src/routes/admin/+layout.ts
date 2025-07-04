import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load({ parent }) {
	const pd = await parent();

	const userInfoData = get(pd.UserInfo);

	if (!(userInfoData.data?.me.__typename === 'User' && userInfoData.data?.me.isAdmin)) {
		error(403, 'You are not allowed to view this page');
	}
}
