import { load_AdminReconcilers } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Reconcilers' })),
		...(await load_AdminReconcilers({
			event
		}))
	};
}
