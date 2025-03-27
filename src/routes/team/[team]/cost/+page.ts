import { load_TeamCost } from '$houdini';
import { subDays, subMonths } from 'date-fns';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const interval = event.url.searchParams.get('interval') ?? '1';

	const to = subDays(new Date(), 2);
	const from = subMonths(new Date(), isNaN(Number(interval)) ? 1 : Number(interval));

	return {
		interval,
		to,
		from,
		...(await load_TeamCost({
			event,
			variables: {
				team: event.params.team,
				to,
				from
			}
		}))
	};
};
