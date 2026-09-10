import {
	load_CostMonthly,
	load_TenantCost,
	loadAll,
	OrderDirection,
	TeamOrderField
} from '$houdini';
import { getFromForTenantCost, type TenantCostInterval } from '$lib/domain/cost/dateUtils';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { subDays } from 'date-fns';

const validIntervals: TenantCostInterval[] = ['5y', '3y', '1y', '6m'];

const rows = 20;

export async function load(event) {
	const intervalParam = event.url.searchParams.get('interval');
	const interval: TenantCostInterval =
		intervalParam && validIntervals.includes(intervalParam as TenantCostInterval)
			? (intervalParam as TenantCostInterval)
			: '6m';
	const to = subDays(new Date(), 2);
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		interval,
		...(await addPageMeta(event, { title: 'Tenant Cost' })),
		...(await loadAll(
			load_TenantCost({
				event,
				variables: {
					orderBy: {
						field: urlToOrderField(TeamOrderField, TeamOrderField.ACCUMULATED_COST, event.url),
						direction: urlToOrderDirection(event.url, OrderDirection.DESC)
					},
					...(before ? { before, last: rows } : { after, first: rows })
				}
			}),
			load_CostMonthly({
				event,
				variables: {
					from: getFromForTenantCost(interval, to),
					to: subDays(new Date(), 2)
				}
			})
		))
	};
}
