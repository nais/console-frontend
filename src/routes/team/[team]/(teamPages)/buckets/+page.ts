import {
	BucketOrderField,
	type BucketOrder,
	type BucketOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { AfterLoadEvent, BucketsVariables } from './$houdini';

export const _BucketsVariables: BucketsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		BucketOrderField.NAME) as BucketOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;
	const rows: number = parseInt(url.searchParams.get('rows') || '10');

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	// Date 30 days ago
	const from = new Date();
	from.setDate(from.getDate() - 30);

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);

	return {
		orderBy: { field: field, direction: direction } as BucketOrder,
		...(before ? { before, last: rows } : { after, first: rows }),
		from,
		to
	};
};

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
	return {
		data
	};
}
