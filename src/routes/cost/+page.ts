import { getFromForTenantCost, type TenantCostInterval } from '$lib/domain/cost/dateUtils';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OrderDirection, TeamOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { format, subDays } from 'date-fns';
import { CostMonthlyQuery, TenantCostQuery } from './cost';

const rows = 20;

export async function load(event) {
	const interval = (event.url.searchParams.get('interval') ?? '6m') as TenantCostInterval;
	const to = subDays(new Date(), 2);

	const [TenantCost, CostMonthly] = await Promise.all([
		runQuery(event, TenantCostQuery, {
			orderBy: {
				field: urlToOrderField(TeamOrderField, TeamOrderField.ACCUMULATED_COST, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...readCursorPagination(event.url, rows)
		}),
		runQuery(event, CostMonthlyQuery, {
			from: format(getFromForTenantCost(interval, to), 'yyyy-MM-dd'),
			to: format(subDays(new Date(), 2), 'yyyy-MM-dd')
		})
	]);

	return {
		interval,
		...(await addPageMeta(event, { title: 'Tenant Cost' })),
		TenantCost,
		CostMonthly
	};
}
