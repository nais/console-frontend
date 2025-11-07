import { load_Deployments } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Deployments' })),
		...(await load_Deployments({
			event,
			variables: {
				team: event.params.team,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
