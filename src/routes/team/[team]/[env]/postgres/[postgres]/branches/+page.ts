import { load_PostgresBranches } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Branches' })),
		...(await load_PostgresBranches({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				env: event.params.env,
				name: event.params.postgres,
				first: 20
			}
		}))
	};
}
