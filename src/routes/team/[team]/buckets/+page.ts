import { BucketOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
import type { AfterLoadEvent, BucketsVariables } from './$houdini';

const rows = 25;

export const _BucketsVariables: BucketsVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		orderBy: {
			field: urlToOrderField(BucketOrderField, BucketOrderField.NAME, url),
			direction: urlToOrderDirection(url)
		},
		...(before ? { before, last: rows } : { after, first: rows }),
		from: startOfMonth(subMonths(new Date(), 1)),
		to: endOfYesterday()
	};
};

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
	return { data };
}
