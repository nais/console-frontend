import { load_TeamOverview } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.team })),
		...(await load_TeamOverview({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
