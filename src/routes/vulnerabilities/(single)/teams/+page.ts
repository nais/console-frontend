import { addPageMeta } from '#lib/utils/pageMeta.js';
import { load_TenantVulnerabilityTeams, load_TenantV0sTeams } from '$houdini';

const rows = 20;

export async function load(event) {
	const before = event.url.searchParams.get('before') || null;
	const after = event.url.searchParams.get('after') || null;
	const v0s = (await event.parent()).v0sVulnerabilities;
	const variables = {
		first: before ? null : rows,
		last: before ? rows : null,
		after: before ? null : after,
		before
	};

	return {
		...(await addPageMeta(event, {
			title: 'Team Security Posture'
		})),
		...(v0s
			? {
					...(await load_TenantV0sTeams({ event, blocking: true, variables })),
					TenantVulnerabilityTeams: undefined
				}
			: {
					...(await load_TenantVulnerabilityTeams({ event, blocking: true, variables })),
					TenantV0sTeams: undefined
				})
	};
}
