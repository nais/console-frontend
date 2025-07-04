import { BucketOrderField, load_Buckets } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { startOfMonth, subMonths } from 'date-fns';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_Buckets({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(BucketOrderField, BucketOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				from: startOfMonth(subMonths(new Date(), 12)),
				to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
			}
		}))
	};
}
