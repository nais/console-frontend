import { addPageMeta } from '#lib/utils/pageMeta.js';
import { load_TenantVulnerabilityTeams } from '$houdini';

const rows = 20;

export async function load(event) {
	const before = event.url.searchParams.get('before') || null;
	const after = event.url.searchParams.get('after') || null;

	return {
		...(await addPageMeta(event, {
			title: 'Team Security Posture'
		})),
		...(await load_TenantVulnerabilityTeams({
			event,
			blocking: true,
			variables: {
				first: before ? null : rows,
				last: before ? rows : null,
				after: before ? null : after,
				before
			}
		}))
	};
}
