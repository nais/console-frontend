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

	// First day of previous month
	const from = new Date();
	from.setMonth(from.getMonth() - 1, 1); // Set to first day of previous month
	from.setHours(0, 0, 0, 0); // Reset time to start of the day

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);
	to.setHours(23, 59, 59, 999); // Set time to end of the day

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
