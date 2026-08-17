import { load_JobNetworkPolicy } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Network'
		})),
		...(await load_JobNetworkPolicy({
			event,
			variables: {
				job: event.params.job,
				env: event.params.env,
				team: event.params.team
			}
		}))
	};
}
