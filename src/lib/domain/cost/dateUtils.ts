import { subDays, subMonths, subYears } from 'date-fns';

export type CostInterval = '1y' | '6m' | '90d' | '30d';
export type TenantCostInterval = '5y' | '3y' | '1y' | '6m';

export function getFromForCost(interval: CostInterval, to: Date = new Date()): Date {
	switch (interval) {
		case '1y':
			return subYears(to, 1);
		case '6m':
			return subMonths(to, 6);
		case '90d':
			return subDays(to, 90);
		case '30d':
			return subDays(to, 30);
		default:
			return subDays(to, 30);
	}
}

export function getFromForTenantCost(interval: TenantCostInterval, to: Date = new Date()): Date {
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
}
