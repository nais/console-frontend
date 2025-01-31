import {
	ApplicationOrderField,
	type ApplicationOrder,
	type ApplicationOrderField$options,
	type OrderDirection$options,
	type TeamApplicationsFilter
} from '$houdini';
import type { AfterLoadEvent, ApplicationsVariables } from './$houdini';
export const _ApplicationsVariables: ApplicationsVariables = ({ url }) => {
	const filter: string = url.searchParams.get('filter') || '';
	const environments: string[] = url.searchParams.get('environments')?.split(',') || [];
	const field: string = (url.searchParams.get('field') ||
		ApplicationOrderField.NAME) as ApplicationOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;
	const rows: number = parseInt(url.searchParams.get('rows') || '10');

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		filter: { name: filter, environments } as TeamApplicationsFilter,
		orderBy: { field: field, direction: direction } as ApplicationOrder,
		...(before ? { before, last: rows } : { after, first: rows })
	};
};

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	return {
		data,
		initialEnvironments: url.searchParams.get('environments') ?? null
	};
}
