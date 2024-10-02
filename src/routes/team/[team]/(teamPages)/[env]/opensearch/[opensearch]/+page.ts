import {
	OpenSearchAccessOrderField,
	type OpenSearchAccessOrderField$options,
	type OrderDirection$options
} from '$houdini';
import type { OpenSearchInstanceVariables } from './$houdini';
export const _OpenSearchInstanceVariables: OpenSearchInstanceVariables = ({ url, params }) => {
	const field = (url.searchParams.get('field') ||
		OpenSearchAccessOrderField.WORKLOAD) as OpenSearchAccessOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		orderBy: { field: field, direction: direction },
		environment: params.env,
		team: params.team,
		name: params.opensearch
	};
};
