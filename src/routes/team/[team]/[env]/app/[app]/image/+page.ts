import { load_SetImageVersionData } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const pd = await event.parent();

	if (!pd.viewerIsMember) {
		error(403, 'You are not allowed to view this page');
	}

	return {
		...(await addPageMeta(event, { title: `Set image version for ${event.params.app}` })),
		...(await load_SetImageVersionData({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
}
