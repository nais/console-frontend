import type {
	ApplicationOrder,
	ApplicationOrderField$options,
	OrderDirection$options
} from '$houdini';
import type { WorkloadsVariables } from './$houdini';
export const _WorkloadsVariables: WorkloadsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') || 'NAME') as ApplicationOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } as ApplicationOrder };
};
