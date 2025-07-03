import { load_Unleash } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const parent = await event.parent();
	const userInfoData = get(parent.UserInfo);

	if (userInfoData.data?.features.unleash.enabled === false) {
		error(404, 'Unleash not enabled');
	}

	return {
		...(await load_Unleash({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
};
