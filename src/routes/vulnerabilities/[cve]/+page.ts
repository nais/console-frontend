import { load_CVEDetails } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	console.log('Loading cve', event.params.cve);
	return {
		...(await addPageMeta(event, { title: event.params.cve })),
		...(await load_CVEDetails({
			event,
			variables: {
				identifier: event.params.cve,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
