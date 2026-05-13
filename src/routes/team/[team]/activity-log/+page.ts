import { load_ActivityLog, type ActivityLogFilter } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const activityTypes =
		event.url.searchParams.get('activityTypes')?.split(',').filter(Boolean) || [];
	const resourceTypes =
		event.url.searchParams.get('resourceTypes')?.split(',').filter(Boolean) || [];
	const environments = event.url.searchParams.get('environments')?.split(',').filter(Boolean) || [];

	const rows = 20;

	return {
		...(await addPageMeta(event, { title: 'Activity Log' })),
		...(await load_ActivityLog({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
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
