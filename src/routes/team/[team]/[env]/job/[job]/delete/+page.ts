import { load_DeleteJobPage } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import type { BeforeLoadEvent } from './$houdini';

export async function _houdini_beforeLoad({ parent }: BeforeLoadEvent) {
	const pd = await parent();

	if (!pd.userIsMember) {
		error(403, 'You are not allowed to view this page');
	}
}

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Delete' })),
		...(await load_DeleteJobPage({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				job: event.params.job
			}
		}))
	};
}
