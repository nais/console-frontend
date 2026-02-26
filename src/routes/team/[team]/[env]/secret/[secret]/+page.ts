import { load_Secret } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const pd = await event.parent();

	if (!pd.viewerIsMember) {
		error(403, 'You are not allowed to view this page');
	}

	return {
		...(await addPageMeta(event, { title: event.params.secret })),
		...(await load_Secret({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				secret: event.params.secret
			}
		}))
	};
}
