import {
	load_Secrets,
	SecretOrderField,
	type OrderDirection$options,
	type SecretFilter,
	type SecretOrder,
	type SecretOrderField$options
} from '$houdini';

export async function load(event) {
	const filter = event.url.searchParams.get('filter') || '';
	const field = (event.url.searchParams.get('field') ||
		SecretOrderField.NAME) as SecretOrderField$options;
	const direction = (event.url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	let filterVar: SecretFilter | undefined = undefined;

	if (filter === 'inUse' || filter === 'notInUse') {
		filterVar = { inUse: filter === 'inUse' ? true : false };
	}

	return {
		...(await load_Secrets({
			event,
			variables: {
				team: event.params.team,
				orderBy: { field: field, direction: direction } as SecretOrder,
				filter: filterVar
			}
		}))
	};
}
