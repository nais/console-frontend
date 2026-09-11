import { load_TeamVulnerabilities } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 10;

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Vulnerabilities',
			docPath: '/services/vulnerabilities'
		})),
		...(await load_TeamVulnerabilities({
			event,
			variables: {
				team: event.params.team,
				...paginationVariables('high', event.url),
				...paginationVariables('elevated', event.url),
				...paginationVariables('monitor', event.url)
			}
		}))
	};
}

function paginationVariables(group: 'high' | 'elevated' | 'monitor', url: URL) {
	const after = url.searchParams.get(`${group}After`);
	const before = url.searchParams.get(`${group}Before`);

	return before
		? { [`${group}Before`]: before, [`${group}Last`]: rows }
		: { [`${group}After`]: after, [`${group}First`]: rows };
}
