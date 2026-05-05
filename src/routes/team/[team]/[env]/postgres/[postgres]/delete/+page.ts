import { load_DeletePostgresData } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const { parent, params } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	return {
		...(await addPageMeta(event, { title: 'Delete' })),
		...(await load_DeletePostgresData({
			event,
			variables: {
				environment: params.env,
				team: params.team,
				name: params.postgres
			}
		}))
	};
}
