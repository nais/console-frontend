import { load_RunsWithPodNames } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export const ssr = false;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Logs' })),
		...(await load_RunsWithPodNames({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				job: event.params.job
			}
		}))
	};
}
