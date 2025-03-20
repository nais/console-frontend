import { error } from '@sveltejs/kit';
import type { BeforeLoadEvent } from './$houdini';

export async function _houdini_beforeLoad({ parent }: BeforeLoadEvent) {
	const pd = await parent();

	if (
		!pd.viewerIsMember &&
		!(pd.UserInfo.data?.me.__typename === 'User' && pd.UserInfo.data?.me.isAdmin)
	) {
		error(403, 'You are not allowed to view this page');
	}
}
