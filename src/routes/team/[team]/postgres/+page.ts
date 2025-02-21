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

	// Date 30 days ago
	const from = new Date();
	from.setDate(from.getDate() - 30);

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);

	return { orderBy: { field: field, direction: direction }, from, to };
};
