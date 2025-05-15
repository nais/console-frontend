import { subDays } from 'date-fns';
import type { TenantCostVariables } from './$houdini';

export const _TenantCostVariables: TenantCostVariables = () => {
	const to = subDays(new Date(), 2);

	const from = subDays(to, 30);

	return {
		from,
		to
	};
};
