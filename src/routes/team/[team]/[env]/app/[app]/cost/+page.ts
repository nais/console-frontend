import { load_AppCost } from '$houdini';
import { subDays, subMonths, subYears } from 'date-fns';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const interval = event.url.searchParams.get('interval') ?? '30d';
	const to = subDays(new Date(), 2);

	const getFrom = (interval: string): Date => {
		switch (interval) {
			case '1y':
				return subYears(to, 1);
			case '6m':
				return subMonths(to, 6);
			case '90d':
				return subDays(to, 90);
			case '30d':
			default:
				return subDays(to, 30);
		}
	};

	const from = getFrom(interval);

	return {
		interval,
		to,
		from,
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
};
