import { subDays, subMonths } from 'date-fns';

export const intervalOptionsVulnerabilityHistory = ['6m', '30d', '7d'];

export const getFrom = (interval: string): Date => {
	const now = new Date();
	switch (interval) {
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
