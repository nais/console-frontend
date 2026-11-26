import {
	CVEWorkloadOrderField,
	load_CVEDetails,
	load_CVEWorkloads,
	load_GlobalV0sCve
} from '$houdini';
import {
	v0sCveCursor,
	v0sCveFindingFilter,
	v0sCveTeamScope
} from '#lib/domain/vulnerability/v0sCve.js';
import { cveWorkloadOrder } from '#lib/domain/vulnerability/cveWorkloadOrder.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import type { PageLoad } from './$types';

const rows = 25;

export async function load(event: Parameters<PageLoad>[0]) {
	const { v0sVulnerabilities } = await event.parent();
	if (!v0sVulnerabilities) return _loadLegacy(event);

	const identifier = event.params.cve;
	const rowFilter = v0sCveFindingFilter(identifier);
	return {
		v0s: true as const,
		identifier,
		...(await addPageMeta(event, { title: identifier })),
		...(await load_GlobalV0sCve({
			event,
			blocking: true,
			variables: {
				identifier,
				rowFilter,
				filter: { ...rowFilter, ...v0sCveTeamScope(event.url) },
				after: event.url.searchParams.get(v0sCveCursor)
			}
		}))
	};
}

export async function _loadLegacy(event: Parameters<PageLoad>[0]) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const onlyMyTeams = event.url.searchParams.get('myTeams') === 'true';

	return {
		v0s: false as const,
		onlyMyTeams,
		...(await addPageMeta(event, { title: event.params.cve })),
		...(await load_CVEDetails({
			event,
			variables: {
				identifier: event.params.cve
			}
		})),
		...(await load_CVEWorkloads({
			event,
			variables: {
				identifier: event.params.cve,
				orderBy: cveWorkloadOrder(event.url, CVEWorkloadOrderField.TEAM),
				filter: onlyMyTeams ? { teamScope: { memberOfViewer: true } } : null,
				onlyMyTeams,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
