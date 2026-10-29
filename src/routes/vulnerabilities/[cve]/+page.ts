import { CVEWorkloadOrderField, load_CVEDetails, load_CVEWorkloads } from '$houdini';
import { cveWorkloadOrder } from '#lib/domain/vulnerability/cveWorkloadOrder.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const onlyMyTeams = event.url.searchParams.get('myTeams') === 'true';

	return {
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
				filter: onlyMyTeams ? { viewerIsMember: true } : null,
				onlyMyTeams,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
