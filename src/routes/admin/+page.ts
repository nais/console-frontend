import { load_AdminUsers } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Users' })),
		...(await load_AdminUsers({
			event
		}))
	};
}
