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

	return { orderBy: { field: field, direction: direction } };
};
