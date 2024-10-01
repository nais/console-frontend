import type { BucketOrderField$options, OrderDirection$options } from '$houdini';
import type { BucketsVariables } from './$houdini';

export const _BucketsVariables: BucketsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') || 'NAME') as BucketOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } };
};
