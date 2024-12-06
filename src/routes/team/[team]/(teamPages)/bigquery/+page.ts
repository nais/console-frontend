import {
	BigQueryDatasetOrderField,
	type BigQueryDatasetOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { BigQueryVariables } from './$houdini';

export const _BigQueryVariables: BigQueryVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		BigQueryDatasetOrderField.NAME) as BigQueryDatasetOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	// Date 30 days ago
	const from = new Date();
	from.setDate(from.getDate() - 30);

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);

	return { orderBy: { field: field, direction: direction }, from, to };
};
