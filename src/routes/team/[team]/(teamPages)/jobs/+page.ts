import {
	JobOrderField,
	type JobOrder,
	type JobOrderField$options,
	type OrderDirection$options,
	type TeamJobsFilter
} from '$houdini';
import type { AfterLoadEvent, JobsVariables } from './$houdini';

export const _JobsVariables: JobsVariables = ({ url }) => {
	const filter: string = url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		url.searchParams.get('environments') === 'none'
			? undefined
			: url.searchParams.get('environments')?.split(',') || [];
	const field = (url.searchParams.get('field') || JobOrderField.NAME) as JobOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;
	const rows: number = parseInt(url.searchParams.get('rows') || '10');

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		filter: { name: filter, environments } as TeamJobsFilter,
		orderBy: { field: field, direction: direction } as JobOrder,
		...(before ? { before, last: rows } : { after, first: rows })
	};
};

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	return {
		data,
		initialEnvironments: url.searchParams.get('environments') ?? null
	};
}
