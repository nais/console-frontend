import { load_Bucket } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.bucket })),
		...(await load_Bucket({
			event,
			variables: {
				team: event.params.team,
				environment: event.params.env,
				name: event.params.bucket
			}
		}))
	};
}
