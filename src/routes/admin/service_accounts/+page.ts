import { load_AdminServiceAccounts } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Service Accounts'
		})),

		...(await load_AdminServiceAccounts({
			event,
			variables: {
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
