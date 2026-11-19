import { load_Job, load_JobDeployment } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

const rows = 6;

export async function load(event) {
	const { legacyDeployDisabled } = await event.parent();
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: event.params.job })),
		...(await load_Job({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				job: event.params.job,
				legacyDeployDisabled,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		})),
		...(await load_JobDeployment({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				job: event.params.job,
				legacyDeployDisabled
			}
		}))
	};
}
