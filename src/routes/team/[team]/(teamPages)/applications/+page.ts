import {
	ApplicationOrderField,
	type ApplicationOrder,
	type ApplicationOrderField$options,
	type OrderDirection$options,
	type TeamApplicationsFilter
} from '$houdini';
import type { ApplicationsVariables } from './$houdini';
export const _ApplicationsVariables: ApplicationsVariables = ({ url }) => {
	const filter = url.searchParams.get('filter') || '';

	const field = (url.searchParams.get('field') ||
		ApplicationOrderField.STATUS) as ApplicationOrderField$options;
	const direction = (url.searchParams.get('direction') || 'DESC') as OrderDirection$options;

	return {
		filter: { name: filter } as TeamApplicationsFilter,
		orderBy: { field: field, direction: direction } as ApplicationOrder
	};
};
