import { load_TeamSettings } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const pd = await event.parent();
	const userInfoData = get(pd.UserInfo);

	if (
		!pd.viewerIsMember &&
		!(userInfoData.data?.me.__typename === 'User' && userInfoData.data?.me.isAdmin)
	) {
		error(403, 'You are not allowed to view this page');
	}

	return {
		...(await addPageMeta(event, { title: 'Settings' })),
		...(await load_TeamSettings({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
