import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const pd = await parent();

	const userInfoData = await pd.UserInfo.fetch();

	if (!(userInfoData.data?.me.__typename === 'User' && userInfoData.data?.me.isAdmin)) {
		error(403, 'You are not allowed to view this page');
	}
};
