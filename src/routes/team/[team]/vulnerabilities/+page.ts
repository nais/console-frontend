import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TeamVulnerabilitiesQuery } from './teamVulnerabilities';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Vulnerabilities' })),
		TeamVulnerabilities: await runQuery(event, TeamVulnerabilitiesQuery, {
			team: event.params.team
		})
	};
}
