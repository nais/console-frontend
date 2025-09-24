import { load_CreateOpenSearchEnvironments } from '$houdini';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const { parent } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	return {
		...(await load_CreateOpenSearchEnvironments({ event, variables: { slug: event.params.team } }))
	};
}
