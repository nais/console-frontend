import { load_TeamCVEPage, load_TeamCVEWorkloads } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

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
			variables: { identifier, first: ROWS, filter: { teamSlugs: [team] } }
		}))
	};
}
