import { CVEWorkloadOrderField, load_TeamCVEPage, load_TeamCVEWorkloads } from '$houdini';
import { cveWorkloadOrder } from '#lib/domain/vulnerability/cveWorkloadOrder.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

const ROWS = 25;

export async function load(event) {
	const team = event.params.team;
	const identifier = event.params.cve;

	return {
		...(await addPageMeta(event, {
			title: identifier,
			breadcrumbs: [{ label: 'Vulnerabilities', href: '/team/[team]/vulnerabilities' }]
		})),
		teamSlug: team,
		cveIdentifier: identifier,
		rows: ROWS,
		...(await load_TeamCVEPage({
			event,
			variables: { identifier, team }
		})),
		...(await load_TeamCVEWorkloads({
			event,
			variables: {
				identifier,
				first: ROWS,
				filter: { teamSlugs: [team] },
				orderBy: cveWorkloadOrder(event.url, CVEWorkloadOrderField.PACKAGE)
			}
		}))
	};
}
