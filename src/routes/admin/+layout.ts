import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const pd = await parent();

	if (!(pd.UserInfo.data?.me.__typename === 'User' && pd.UserInfo.data?.me.isAdmin)) {
		error(403, 'You are not allowed to view this page');
	}
};
