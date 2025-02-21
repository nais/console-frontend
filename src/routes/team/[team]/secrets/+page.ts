import {
	SecretOrderField,
	type OrderDirection$options,
	type SecretFilter,
	type SecretOrder,
	type SecretOrderField$options
} from '$houdini';
import type { SecretsVariables } from './$houdini';

export const _SecretsVariables: SecretsVariables = ({ url }) => {
	const filter = url.searchParams.get('filter') || '';
	const field = (url.searchParams.get('field') ||
		SecretOrderField.NAME) as SecretOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	if (filter === 'inUse' || filter === 'notInUse') {
		return {
			filter: { inUse: filter === 'inUse' ? true : false } as SecretFilter,
			orderBy: { field: field, direction: direction } as SecretOrder
		};
	}
	return {
		orderBy: { field: field, direction: direction } as SecretOrder
	};
};
