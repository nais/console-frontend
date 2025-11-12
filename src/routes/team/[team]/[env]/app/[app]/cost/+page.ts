import { load_AppCost } from '$houdini';
import { getFromForCost, type CostInterval } from '$lib/domain/cost/dateUtils';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { subDays } from 'date-fns';

export async function load(event) {
	const interval = (event.url.searchParams.get('interval') ?? '30d') as CostInterval;
	const to = subDays(new Date(), 2);
	const from = getFromForCost(interval, to);

	return {
		interval,
		to,
		from,
		...(await addPageMeta(event, { title: 'Cost' })),
		...(await load_AppCost({
			event,
			variables: {
				team: event.params.team,
				app: event.params.app,
				env: event.params.env,
				to,
				from
			}
		}))
	};
}
