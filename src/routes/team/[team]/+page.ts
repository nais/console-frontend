import { load_TeamOverview, load_TeamSummaryCost, load_TeamSummaryVulnerabilities } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	const to = new Date();
	to.setDate(to.getDate() - 2);
	const from = new Date(to);
	from.setDate(from.getDate() - 60);

	return {
		...(await addPageMeta(event, { title: event.params.team })),
		...(await load_TeamOverview({
			event,
			variables: {
				team: event.params.team
			}
		})),
		...(await load_TeamSummaryVulnerabilities({
			event,
			variables: {
				team: event.params.team
			}
		})),
		...(await load_TeamSummaryCost({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				from,
				to
			}
		}))
	};
}
