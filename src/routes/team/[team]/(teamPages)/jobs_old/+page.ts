import {
	JobOrderField,
	type JobOrder,
	type JobOrderField$options,
	type OrderDirection$options,
	type TeamJobsFilter
} from '$houdini';
import type { JobsVariables } from './$houdini';

export const _JobsVariables: JobsVariables = ({ url }) => {
	const filter: string = url.searchParams.get('filter') || '';
	const environments: string[] = url.searchParams.get('environments')?.split(',') || [];
	const field = (url.searchParams.get('field') || JobOrderField.STATUS) as JobOrderField$options;
	const direction = (url.searchParams.get('direction') || 'DESC') as OrderDirection$options;

	return {
		filter: { name: filter, environments } as TeamJobsFilter,
		orderBy: { field: field, direction: direction } as JobOrder
	};
};
