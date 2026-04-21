import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { JobOrderField, OrderDirection } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { JobsListMetadataQuery, JobsQuery } from './jobs';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments') === 'none'
			? undefined
			: event.url.searchParams.get('environments')?.split(',') || [];

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Jobs' })),
		Jobs: await runQuery(event, JobsQuery, {
			team: event.params.team,
			filter: { name: filter, environments },
			orderBy: {
				field: urlToOrderField(JobOrderField, JobOrderField.ISSUES, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...(before ? { before, last: rows } : { after, first: rows })
		}),
		JobsListMetadata: await runQuery(event, JobsListMetadataQuery, {
			team: event.params.team
		})
	};
}
