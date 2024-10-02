import {
	BucketOrderField,
	type BucketOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { BucketsVariables } from './$houdini';

export const _BucketsVariables: BucketsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		BucketOrderField.NAME) as BucketOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } };
};
