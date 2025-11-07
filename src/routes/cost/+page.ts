import {
	load_CostMonthly,
	load_TenantCost,
	loadAll,
	OrderDirection,
	TeamOrderField
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { subDays, subMonths, subYears } from 'date-fns';

const rows = 20;

export async function load(event) {
	const interval = event.url.searchParams.get('interval') ?? '6m';
	const to = subDays(new Date(), 2);
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	const getFrom = (interval: string): Date => {
		switch (interval) {
			case '5y':
				return subYears(to, 5);
			case '3y':
				return subYears(to, 3);
			case '1y':
				return subYears(to, 1);
			case '6m':
				return subMonths(to, 6);
			default:
				return subMonths(to, 6);
		}
	};

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
					from: getFrom(interval),
					to: subDays(new Date(), 2)
				}
			})
		))
	};
}
