import { getFromForCost, type CostInterval } from '$lib/domain/cost/dateUtils';
import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { format, subDays } from 'date-fns';
import { AppCostQuery } from './appCost';

export async function load(event) {
	const interval = (event.url.searchParams.get('interval') ?? '30d') as CostInterval;
	const to = subDays(new Date(), 2);
	const from = getFromForCost(interval, to);

	return {
		interval,
		to,
		from,
		...(await addPageMeta(event, { title: 'Cost' })),
		AppCost: await runQuery(event, AppCostQuery, {
			team: event.params.team,
			app: event.params.app,
			env: event.params.env,
			// `Date` scalar is `YYYY-MM-DD` on the wire. Houdini auto-formatted
			// JS `Date` instances; with urql we serialize explicitly.
			from: format(from, 'yyyy-MM-dd'),
			to: format(to, 'yyyy-MM-dd')
		})
	};
}
