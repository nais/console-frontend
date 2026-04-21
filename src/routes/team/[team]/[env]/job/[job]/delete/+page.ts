import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { DeleteJobPageQuery } from './delete';

export async function load(event) {
	const pd = await event.parent();

	if (!pd.viewerIsMember) {
		error(403, 'You are not allowed to view this page');
	}

	return {
		...(await addPageMeta(event, { title: 'Delete' })),
		DeleteJobPage: await runQuery(event, DeleteJobPageQuery, {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job
		})
	};
}
