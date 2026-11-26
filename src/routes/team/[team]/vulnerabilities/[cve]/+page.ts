import {
	CVEWorkloadOrderField,
	load_TeamCVEPage,
	load_TeamCVEWorkloads,
	load_TeamV0sCve
} from '$houdini';
import { v0sCveCursor, v0sCveFindingFilter } from '#lib/domain/vulnerability/v0sCve.js';
import { cveWorkloadOrder } from '#lib/domain/vulnerability/cveWorkloadOrder.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import type { PageLoad } from './$types';

const ROWS = 25;

export async function load(event: Parameters<PageLoad>[0]) {
	const { v0sVulnerabilities } = await event.parent();
	if (!v0sVulnerabilities) return _loadLegacy(event);

	const { team, cve: identifier } = event.params;
	const rowFilter = v0sCveFindingFilter(identifier);
	return {
		v0s: true as const,
		teamSlug: team,
		identifier,
		...(await addPageMeta(event, {
			title: identifier,
			breadcrumbs: [{ label: 'Vulnerabilities', href: '/team/[team]/vulnerabilities' }]
		})),
		...(await load_TeamV0sCve({
			event,
			blocking: true,
			variables: {
				team,
				identifier,
				rowFilter,
				filter: rowFilter,
				after: event.url.searchParams.get(v0sCveCursor)
			}
		}))
	};
}

export async function _loadLegacy(event: Parameters<PageLoad>[0]) {
	const team = event.params.team;
	const identifier = event.params.cve;

	return {
		v0s: false as const,
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
