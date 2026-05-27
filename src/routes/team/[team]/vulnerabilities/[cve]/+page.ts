import { load_TeamCVEDetails, load_TeamCVEWorkloads, load_TeamCVEWorkloadsCount } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	const team = event.params.team;
	const filter = { teamSlugs: [team] };

	const { TeamCVEWorkloadsCount } = await load_TeamCVEWorkloadsCount({
		event,
		variables: { identifier: event.params.cve, filter }
	});

	const countData = await TeamCVEWorkloadsCount.fetch();
	const totalCount = Math.max(countData.data?.cve?.workloads.pageInfo.totalCount ?? 1, 1);

	return {
		...(await addPageMeta(event, {
			title: event.params.cve,
			breadcrumbs: [{ label: 'Vulnerabilities', href: '/team/[team]/vulnerabilities' }]
		})),
		teamSlug: team,
		...(await load_TeamCVEDetails({
			event,
			variables: {
				identifier: event.params.cve
			}
		})),
		...(await load_TeamCVEWorkloads({
			event,
			variables: {
				identifier: event.params.cve,
				first: totalCount,
				filter
			}
		}))
	};
}
