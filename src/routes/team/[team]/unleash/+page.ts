import { load_Unleash, load_UnleashReleaseChannels } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const parent = await event.parent();
	const userInfoData = get(parent.UserInfo);

	if (userInfoData.data?.features.unleash.enabled === false) {
		error(404, 'Unleash not enabled');
	}

	return {
		...(await addPageMeta(event, { title: 'Unleash' })),
		...(await load_Unleash({
			event,
			variables: {
				team: event.params.team
			}
		})),
		...(await load_UnleashReleaseChannels({ event }))
	};
}
