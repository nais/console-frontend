import { addPageMeta } from '$lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const pd = await event.parent();

	const userInfo = pd.UserInfo;

	if (!(userInfo.data?.me.__typename === 'User' && userInfo.data?.me.isAdmin)) {
		error(403, 'You are not allowed to view this page');
	}

	return {
		...(await addPageMeta(event, {
			title: 'Administration',
			breadcrumbs: [
				{
					label: 'Admin',
					href: '/admin'
				}
			]
		}))
	};
}
