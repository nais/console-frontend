import {
	load_ValkeyInstance,
	ValkeyInstanceAccessOrderField,
	type OrderDirection$options,
	type ValkeyInstanceAccessOrderField$options
} from '$houdini';

export async function load(event) {
	const field = (event.url.searchParams.get('field') ||
		ValkeyInstanceAccessOrderField.WORKLOAD) as ValkeyInstanceAccessOrderField$options;
	const direction = (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		...(await load_ValkeyInstance({
			event,
			variables: {
				orderBy: { field: field, direction: direction },
				environment: event.params.env,
				team: event.params.team,
				name: event.params.valkey
			}
		}))
	};
}
