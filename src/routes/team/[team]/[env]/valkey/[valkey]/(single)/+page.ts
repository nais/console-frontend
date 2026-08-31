import {
	load_Valkey,
	type OrderDirection$options,
	ValkeyAccessOrderField,
	type ValkeyAccessOrderField$options
} from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const fieldParam = event.url.searchParams.get('field') || ValkeyAccessOrderField.WORKLOAD;
	const field: ValkeyAccessOrderField$options = Object.values(ValkeyAccessOrderField).includes(
		fieldParam as ValkeyAccessOrderField$options
	)
		? (fieldParam as ValkeyAccessOrderField$options)
		: ValkeyAccessOrderField.WORKLOAD;
	const direction: OrderDirection$options =
		event.url.searchParams.get('direction') === 'DESC' ? 'DESC' : 'ASC';

	const loadValkey = await load_Valkey({
		event,
		blocking: true,
		variables: {
			orderBy: { field: field, direction: direction },
			environment: event.params.env,
			team: event.params.team,
			name: event.params.valkey
		}
	});

	const name = get(loadValkey.Valkey).data?.team.environment.valkey.name;
	if (!!name && name !== event.params.valkey) {
		redirect(307, `/team/${event.params.team}/${event.params.env}/valkey/${name}`);
	}

	return {
		...(await addPageMeta(event, { title: event.params.valkey, docPath: '/persistence/valkey/' })),
		...loadValkey
	};
}
