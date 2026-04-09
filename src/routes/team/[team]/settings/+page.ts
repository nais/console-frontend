import { load_TeamSettings } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	const parent = await event.parent();
	return {
		...(await addPageMeta(event, { title: 'Settings' })),
		...(await load_TeamSettings({
			event,
			variables: {
				team: event.params.team,
				viewerIsMember: parent.viewerIsMember
			}
		}))
	};
}
