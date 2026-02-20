import { load_PostgresInstances, OrderDirection, PostgresInstanceOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Postgres Instances' })),
		...(await load_PostgresInstances({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(
						PostgresInstanceOrderField,
						PostgresInstanceOrderField.NAME,
						event.url
					),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
