import {
	ValkeyInstanceAccessOrderField,
	type OrderDirection$options,
	type ValkeyInstanceAccessOrderField$options
} from '$houdini';
import type { ValkeyInstanceVariables } from './$houdini';
export const _ValkeyInstanceVariables: ValkeyInstanceVariables = ({ url, params }) => {
	const field = (url.searchParams.get('field') ||
		ValkeyInstanceAccessOrderField.WORKLOAD) as ValkeyInstanceAccessOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		orderBy: { field: field, direction: direction },
		environment: params.env,
		team: params.team,
		name: params.valkey
	};
};
