import { load_TenantVulnerabilites } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Vulnerabilities'
		})),
		...(await load_TenantVulnerabilites({
			event
		}))
	};
}
