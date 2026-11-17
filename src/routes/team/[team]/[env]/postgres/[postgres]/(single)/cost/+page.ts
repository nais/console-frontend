import { load_PostgresCosts } from '$houdini';
import { getFromForCost, type CostInterval } from '#lib/domain/cost/dateUtils.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { subDays } from 'date-fns';

export async function load(event) {
	const requestedInterval = event.url.searchParams.get('interval');
	const interval: CostInterval =
		requestedInterval === '90d' || requestedInterval === '6m' || requestedInterval === '1y'
			? requestedInterval
			: '30d';
	const to = subDays(new Date(), 2);
	const from = getFromForCost(interval, to);

	return {
		interval,
		from,
		to,
		...(await addPageMeta(event, { title: 'Cost', pageHeaderTitle: event.params.postgres })),
		...(await load_PostgresCosts({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				name: event.params.postgres,
				from,
				to
			}
		}))
	};
}
