import { load_ApplicationActivityLog, type ActivityLogFilter } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 20;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const activityTypes =
		event.url.searchParams.get('activityTypes')?.split(',').filter(Boolean) || [];
	const resourceTypes =
		event.url.searchParams.get('resourceTypes')?.split(',').filter(Boolean) || [];
	const environments = event.url.searchParams.get('environments')?.split(',').filter(Boolean) || [];

	return {
		...(await addPageMeta(event, {
			title: 'Activity Log'
		})),
		...(await load_ApplicationActivityLog({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app,
				...(before ? { before, last: rows } : { after: after || undefined, first: rows }),
				filter: {
					activityTypes,
					resourceTypes,
					environments
				} as ActivityLogFilter
			}
		}))
	};
}
