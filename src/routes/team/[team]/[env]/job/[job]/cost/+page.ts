import { load_JobCost } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { subDays, subMonths, subYears } from 'date-fns';

export async function load(event) {
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
		...(await addPageMeta(event, { title: 'Cost' })),
		interval,
		to,
		from,
		...(await load_JobCost({
			event,
			variables: {
				team: event.params.team,
				job: event.params.job,
				env: event.params.env,
				to,
				from
			}
		}))
	};
}
