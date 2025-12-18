import { load_TenantDeployments } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { subDays, subMonths } from 'date-fns';

const rows = 25;

const intervalOptions = ['7d', '30d', '6m', 'all'] as const;
type Interval = (typeof intervalOptions)[number];

function getFromDate(interval: Interval): Date | null {
	const now = new Date();
	switch (interval) {
		case '6m':
			return subMonths(now, 6);
		case '30d':
			return subDays(now, 30);
		case '7d':
			return subDays(now, 7);
		case 'all':
			return null;
		default:
			return subDays(now, 7);
	}
}

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const intervalParam = event.url.searchParams.get('interval') as Interval | null;
	const interval = intervalParam && intervalOptions.includes(intervalParam) ? intervalParam : '7d';
	const from = getFromDate(interval);
	return {
		...(await addPageMeta(event, {
			title: 'Tenant Deployments'
		})),
		...(await load_TenantDeployments({
			event,
			variables: {
				...(before ? { before, last: rows } : after ? { after, first: rows } : { first: rows }),
				...(from ? { filter: { from } } : {})
			}
		}))
	};
}
