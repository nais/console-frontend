import type { OpenSearchOrderField$options, OrderDirection$options } from '$houdini';
import type { OpenSearchVariables } from './$houdini';

export const _OpenSearchVariables: OpenSearchVariables = ({ url }) => {
	const field = (url.searchParams.get('field') || 'NAME') as OpenSearchOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } };
};
