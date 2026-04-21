import { getFromForCost, type CostInterval } from '$lib/domain/cost/dateUtils';
import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { format, subDays } from 'date-fns';
import { TeamCostQuery } from './teamCost';

export async function load(event) {
	const interval = (event.url.searchParams.get('interval') ?? '30d') as CostInterval;
	const to = subDays(new Date(), 2);
	const from = getFromForCost(interval, to);

	return {
		...(await addPageMeta(event, { title: 'Cost' })),
		interval,
		to,
		from,
		TeamCost: await runQuery(event, TeamCostQuery, {
			team: event.params.team,
			// `Date` scalar is `YYYY-MM-DD` on the wire. Houdini auto-formatted
			// JS `Date` instances; with urql we serialize explicitly.
			from: format(from, 'yyyy-MM-dd'),
			to: format(to, 'yyyy-MM-dd')
		})
	};
}
