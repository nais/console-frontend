import { load_JobDeploys } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Deployments' })),
		...(await load_JobDeploys({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				job: event.params.job,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
