import { envTagVariant } from '#lib/envTagVariant.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			tag: { label: event.params.env, variant: envTagVariant(event.params.env) }
		}))
	};
}
