import { load_TeamVulnerabilities } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Vulnerabilities' })),
		...(await load_TeamVulnerabilities({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
