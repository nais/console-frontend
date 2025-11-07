import { envTagVariant } from '$lib/envTagVariant';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			tag: { label: event.params.env, variant: envTagVariant(event.params.env) }
		}))
	};
}
