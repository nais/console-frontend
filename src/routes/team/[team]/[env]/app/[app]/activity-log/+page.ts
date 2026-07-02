import { load_ApplicationActivityLog, type ActivityLogFilter } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 20;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const activityTypes =
		event.url.searchParams.get('activityTypes')?.split(',').filter(Boolean) || [];

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
					activityTypes
				} as ActivityLogFilter
			}
		}))
	};
}
