import { load_TenantCost } from '$houdini';
import { subDays, subMonths, subYears } from 'date-fns';

export async function load(event) {
	const interval = event.url.searchParams.get('interval') ?? '6m';
	const to = subDays(new Date(), 2);

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
		...(await load_TenantCost({
			event,
			variables: { from: getFrom(interval), to: subDays(new Date(), 2) }
		}))
	};
}
