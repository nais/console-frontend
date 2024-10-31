import {
	SecretOrderField,
	type OrderDirection$options,
	type SecretOrder,
	type SecretOrderField$options
} from '$houdini';
import type { SecretsVariables } from './$houdini';

export const _SecretsVariables: SecretsVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		SecretOrderField.NAME) as SecretOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } as SecretOrder };
};
