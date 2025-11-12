import { load_SqlInstances, OrderDirection, SqlInstanceOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';
import { startOfMonth, subMonths } from 'date-fns';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Postgres Instances' })),
		...(await load_SqlInstances({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(SqlInstanceOrderField, SqlInstanceOrderField.ISSUES, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				from: startOfMonth(subMonths(new Date(), 12)),
				to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
			}
		}))
	};
}
