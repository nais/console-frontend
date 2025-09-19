import {
	load_Valkey,
	type OrderDirection$options,
	ValkeyAccessOrderField,
	type ValkeyAccessOrderField$options
} from '$houdini';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const field = (event.url.searchParams.get('field') ||
		ValkeyAccessOrderField.WORKLOAD) as ValkeyAccessOrderField$options;
	const direction = (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

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
		...loadValkey
	};
}
