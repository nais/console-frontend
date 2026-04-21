import { getFromForCost, type CostInterval } from '$lib/domain/cost/dateUtils';
import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { format, subDays } from 'date-fns';
import { JobCostQuery } from './jobCost';

export async function load(event) {
	const interval = (event.url.searchParams.get('interval') ?? '30d') as CostInterval;
	const to = subDays(new Date(), 2);
	const from = getFromForCost(interval, to);

	return {
		...(await addPageMeta(event, { title: 'Cost' })),
		interval,
		to,
		from,
		JobCost: await runQuery(event, JobCostQuery, {
			team: event.params.team,
			job: event.params.job,
			env: event.params.env,
			to: format(to, 'yyyy-MM-dd'),
			from: format(from, 'yyyy-MM-dd')
		})
	};
}
