import {
	WorkloadOrderField,
	type OrderDirection$options,
	type TeamWorkloadsFilter,
	type WorkloadOrder,
	type WorkloadOrderField$options
} from '$houdini';
import type { TeamVulnerabilitiesVariables } from './$houdini';
export const _TeamVulnerabilitiesVariables: TeamVulnerabilitiesVariables = ({ url }) => {
	const filter = url.searchParams.get('filter') || '';
	const field = (url.searchParams.get('field') ||
		WorkloadOrderField.VULNERABILITY_RISK_SCORE) as WorkloadOrderField$options;
	const direction = (url.searchParams.get('direction') || 'DESC') as OrderDirection$options;

	if (filter === '') {
		return {
			orderBy: { field: field, direction: direction } as WorkloadOrder
		};
	}

	return {
		filter: { environments: [filter] } as TeamWorkloadsFilter,
		orderBy: { field: field, direction: direction } as WorkloadOrder
	};
};
