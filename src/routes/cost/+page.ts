import { startOfMonth, subMonths } from 'date-fns';
import type { TenantCostVariables } from './$houdini';

export const _TenantCostVariables: TenantCostVariables = () => {
	return {
		from: startOfMonth(subMonths(new Date(), 12)),
		to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
	};
};
