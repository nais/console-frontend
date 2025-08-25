import { load_CreateValkeyEnvironments } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const parent = await event.parent();
	const userInfoData = get(parent.UserInfo);

	if (userInfoData.data?.features.valkey.enabled === false) {
		error(404, 'Valkey not enabled');
	}
	return {
		...(await load_CreateValkeyEnvironments({ event, variables: { slug: event.params.team } }))
	};
}
