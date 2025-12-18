import { load_TenantDeployments } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	return {
		...(await addPageMeta(event, {
			title: 'Tenant Deployments'
		})),
		...(await load_TenantDeployments({
			event,
			variables: {
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
