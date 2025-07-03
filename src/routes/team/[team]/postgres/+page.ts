import { load_SqlInstances, SqlInstanceOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { startOfMonth, subMonths } from 'date-fns';
import type { PageLoad } from './$houdini';

const rows = 25;

export const load: PageLoad = async (event) => {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_SqlInstances({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(SqlInstanceOrderField, SqlInstanceOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				from: startOfMonth(subMonths(new Date(), 12)),
				to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
			}
		}))
	};
};
