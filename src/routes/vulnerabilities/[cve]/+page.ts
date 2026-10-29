import { CVEWorkloadOrderField, graphql, load_CVEDetails, load_CVEWorkloads } from '$houdini';
import { cveWorkloadOrder } from '#lib/domain/vulnerability/cveWorkloadOrder.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import type { PageLoadEvent } from './$types';

const rows = 25;

const viewerTeams = graphql(`
	query CVEViewerTeams {
		me {
			__typename
			... on User {
				teams(first: 1000) {
					nodes {
						team {
							slug
						}
					}
				}
			}
		}
	}
`);

const viewerTeamSlugs = async (event: PageLoadEvent) => {
	const result = await viewerTeams.fetch({ event });
	if (result.data?.me.__typename !== 'User') {
		return [];
	}
	return result.data.me.teams.nodes.map((node) => node.team.slug);
};

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const onlyMyTeams = event.url.searchParams.get('myTeams') === 'true';
	const teamSlugs = onlyMyTeams ? await viewerTeamSlugs(event) : [];

	return {
		onlyMyTeams,
		hasViewerTeams: !onlyMyTeams || teamSlugs.length > 0,
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
				filter: teamSlugs.length > 0 ? { teamSlugs } : null,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
