import {
	RepositoryOrderField,
	type OrderDirection$options,
	type RepositoryOrder,
	type RepositoryOrderField$options,
	type TeamRepositoryFilter
} from '$houdini';
import type { RepositoriesVariables } from './$houdini';
export const _RepositoriesVariables: RepositoriesVariables = ({ url }) => {
	const filter = url.searchParams.get('filter');

	const field = (url.searchParams.get('field') ||
		RepositoryOrderField.NAME) as RepositoryOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		orderBy: { field: field, direction: direction } as RepositoryOrder,
		filter: { name: filter } as TeamRepositoryFilter
	};
};
