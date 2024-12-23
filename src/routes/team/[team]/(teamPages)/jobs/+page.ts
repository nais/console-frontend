import {
	JobOrderField,
	type JobOrder,
	type JobOrderField$options,
	type OrderDirection$options,
	type TeamJobsFilter
} from '$houdini';
import type { JobsVariables } from './$houdini';

export const _JobsVariables: JobsVariables = ({ url }) => {
	const filter = url.searchParams.get('filter') || '';
	const field = (url.searchParams.get('field') || JobOrderField.STATUS) as JobOrderField$options;
	const direction = (url.searchParams.get('direction') || 'DESC') as OrderDirection$options;

	return {
		orderBy: { field: field, direction: direction } as JobOrder,
		filter: { name: filter } as TeamJobsFilter
	};
};
