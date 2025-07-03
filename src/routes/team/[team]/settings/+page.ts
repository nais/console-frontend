import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { BeforeLoadEvent } from './$houdini';

export async function _houdini_beforeLoad({ parent }: BeforeLoadEvent) {
	const pd = await parent();

	const userInfoData = get(pd.UserInfo);

	if (
		!pd.viewerIsMember &&
		!(userInfoData.data?.me.__typename === 'User' && userInfoData.data?.me.isAdmin)
	) {
		error(403, 'You are not allowed to view this page');
	}
}
