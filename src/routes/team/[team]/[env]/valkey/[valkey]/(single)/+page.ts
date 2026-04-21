import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OrderDirection, ValkeyAccessOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { redirect } from '@sveltejs/kit';
import { ValkeyQuery } from './valkey';

const rows = 10;

export async function load(event) {
	const Valkey = await runQuery(event, ValkeyQuery, {
		environment: event.params.env,
		team: event.params.team,
		name: event.params.valkey,
		orderBy: {
			field: urlToOrderField(ValkeyAccessOrderField, ValkeyAccessOrderField.WORKLOAD, event.url),
			direction: urlToOrderDirection(event.url, OrderDirection.ASC)
		},
		...readCursorPagination(event.url, rows)
	});

	const name = Valkey.data?.team.environment.valkey.name;
	if (!!name && name !== event.params.valkey) {
		redirect(307, `/team/${event.params.team}/${event.params.env}/valkey/${name}`);
	}

	return {
		...(await addPageMeta(event, { title: event.params.valkey })),
		Valkey
	};
}
