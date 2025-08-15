import {
	load_Valkey,
	ValkeyAccessOrderField,
	type OrderDirection$options,
	type ValkeyAccessOrderField$options
} from '$houdini';

export async function load(event) {
	const field = (event.url.searchParams.get('field') ||
		ValkeyAccessOrderField.WORKLOAD) as ValkeyAccessOrderField$options;
	const direction = (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		...(await load_Valkey({
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
