import { load_TenantVulnerabilites } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Vulnerabilities'
		})),
		...(await load_TenantVulnerabilites({
			event,
			variables: {
				first: 1 // We only need the summary, not the teams list
			}
		}))
	};
}
