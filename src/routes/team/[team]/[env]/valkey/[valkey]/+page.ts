import {
	load_Valkey,
	type OrderDirection$options,
	ValkeyAccessOrderField,
	type ValkeyAccessOrderField$options
} from '$houdini';
import { get } from 'svelte/store';
import { redirect } from '@sveltejs/kit';

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

	if (get(loadValkey.Valkey).data?.team.environment.valkey.name !== event.params.valkey) {
		redirect(
			307,
			`/team/${event.params.team}/${event.params.env}/valkey/${get(loadValkey.Valkey).data?.team.environment.valkey.name}`
		);
	}

	return {
		...loadValkey
	};
}
