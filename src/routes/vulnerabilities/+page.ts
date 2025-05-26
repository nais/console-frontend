import { load_TenantVulnerabilites } from '$houdini';
import { subDays, subMonths } from 'date-fns';
import type { PageLoad } from './$houdini';

// const rows = 25;

export const load: PageLoad = async (event) => {
	const interval = event.url.searchParams.get('interval') ?? '7d';

	const getFrom = (interval: string): Date => {
		const now = new Date();
		switch (interval) {
			// case '1y':
			// 	return subYears(now, 1);
			case '6m':
				return subMonths(now, 6);
			case '30d':
				return subDays(now, 30);
			case '7d':
				return subDays(now, 7);
			default:
				return subDays(now, 7);
		}
	};

	const from = getFrom(interval);

	// const after = event.url.searchParams.get('after') || '';
	// const before = event.url.searchParams.get('before') || '';

	return {
		interval,
		...(await load_TenantVulnerabilites({
			event,
			variables: {
				// ...(before ? { before, last: rows } : { after, first: rows }),
				from
			}
		}))
	};
};
