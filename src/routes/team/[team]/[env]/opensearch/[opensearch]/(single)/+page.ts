import {
	load_OpenSearchInstance,
	OpenSearchAccessOrderField,
	type OpenSearchAccessOrderField$options,
	type OrderDirection$options
} from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const loadValkey = await load_OpenSearchInstance({
		event,
		blocking: true,
		variables: {
			environment: event.params.env,
			team: event.params.team,
			name: event.params.opensearch,
			orderBy: {
				field: (event.url.searchParams.get('field') ||
					OpenSearchAccessOrderField.WORKLOAD) as OpenSearchAccessOrderField$options,
				direction: (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options
			}
		}
	});

	const name = get(loadValkey.OpenSearchInstance).data?.team.environment.openSearch.name;
	if (!!name && name !== event.params.opensearch) {
		redirect(307, `/team/${event.params.team}/${event.params.env}/opensearch/${name}`);
	}

	return {
		...(await addPageMeta(event, { title: event.params.opensearch })),
		...loadValkey
	};
}
