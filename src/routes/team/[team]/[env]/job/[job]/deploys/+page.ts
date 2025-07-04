import { load_JobDeploys } from '$houdini';
import type { PageLoad } from './$types';

const rows = 25;

export const load: PageLoad = async (event) => {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
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
};
