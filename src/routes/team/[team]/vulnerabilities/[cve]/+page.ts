import { load_TeamCVEPage } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	const team = event.params.team;

	return {
		...(await addPageMeta(event, {
			title: event.params.cve,
			breadcrumbs: [{ label: 'Vulnerabilities', href: '/team/[team]/vulnerabilities' }]
		})),
		teamSlug: team,
		cveIdentifier: event.params.cve,
		...(await load_TeamCVEPage({
			event,
			variables: { identifier: event.params.cve }
		}))
	};
}
