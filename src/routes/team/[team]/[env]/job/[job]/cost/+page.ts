import { load_JobCost } from '$houdini';
import { getFromForCost, type CostInterval } from '$lib/domain/cost/dateUtils';
import { addPageMeta } from '$lib/utils/pageMeta';
import { subDays } from 'date-fns';

export async function load(event) {
	const interval = (event.url.searchParams.get('interval') ?? '30d') as CostInterval;
	const to = subDays(new Date(), 2);
	const from = getFromForCost(interval, to);

	return {
		...(await addPageMeta(event, { title: 'Cost' })),
		interval,
		to,
		from,
		...(await load_JobCost({
			event,
			variables: {
				team: event.params.team,
				job: event.params.job,
				env: event.params.env,
				to,
				from
			}
		}))
	};
}
