import { load_TenantVulnerabilites, load_TenantV0sOverview } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Vulnerabilities'
		})),
		...((await event.parent()).v0sVulnerabilities
			? { ...(await load_TenantV0sOverview({ event })), TenantVulnerabilites: undefined }
			: { ...(await load_TenantVulnerabilites({ event })), TenantV0sOverview: undefined })
	};
}
