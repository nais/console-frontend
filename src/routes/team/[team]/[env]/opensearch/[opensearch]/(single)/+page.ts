import {
	load_OpenSearchInstance,
	OpenSearchAccessOrderField,
	type OpenSearchAccessOrderField$options
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
				field: Object.values(OpenSearchAccessOrderField).includes(
					event.url.searchParams.get('field') as OpenSearchAccessOrderField$options
				)
					? (event.url.searchParams.get('field') as OpenSearchAccessOrderField$options)
					: OpenSearchAccessOrderField.WORKLOAD,
				direction: event.url.searchParams.get('direction') === 'DESC' ? 'DESC' : 'ASC'
			}
		}
	});

	const name = get(loadValkey.OpenSearchInstance).data?.team.environment.openSearch.name;
	if (!!name && name !== event.params.opensearch) {
		redirect(307, `/team/${event.params.team}/${event.params.env}/opensearch/${name}`);
	}

	return {
		...(await addPageMeta(event, {
			title: event.params.opensearch,
			docPath: '/persistence/opensearch/'
		})),
		...loadValkey
	};
}
