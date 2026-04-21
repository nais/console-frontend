import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TeamSettingsQuery } from './settings';

export async function load(event) {
	const parent = await event.parent();
	return {
		...(await addPageMeta(event, { title: 'Settings' })),
		TeamSettings: await runQuery(event, TeamSettingsQuery, {
			team: event.params.team,
			viewerIsMember: parent.viewerIsMember ?? false
		})
	};
}
