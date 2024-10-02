import {
	SqlInstanceOrderField,
	type OrderDirection$options,
	type SqlInstanceOrderField$options
} from '$houdini';
import type { SqlInstancesVariables } from './$houdini';

export const _SqlInstancesVariables: SqlInstancesVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		SqlInstanceOrderField.NAME) as SqlInstanceOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } };
};
