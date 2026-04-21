import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { ApplicationOrderField, OrderDirection } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { ApplicationsListMetadataQuery, ApplicationsQuery } from './applications';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',') || undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Applications' })),
		Applications: await runQuery(event, ApplicationsQuery, {
			team: event.params.team,
			filter: { name: filter, environments },
			orderBy: {
				field: urlToOrderField(ApplicationOrderField, ApplicationOrderField.ISSUES, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...(before ? { before, last: rows } : { after, first: rows })
		}),
		ApplicationsListMetadata: await runQuery(event, ApplicationsListMetadataQuery, {
			team: event.params.team
		})
	};
}
