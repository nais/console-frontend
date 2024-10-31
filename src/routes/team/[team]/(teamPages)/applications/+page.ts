import {
	ApplicationOrderField,
	type ApplicationOrder,
	type ApplicationOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { WorkloadsVariables } from './$houdini';
export const _WorkloadsVariables: WorkloadsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		ApplicationOrderField.STATUS) as ApplicationOrderField$options;
	const direction = (url.searchParams.get('direction') || 'DESC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } as ApplicationOrder };
};
