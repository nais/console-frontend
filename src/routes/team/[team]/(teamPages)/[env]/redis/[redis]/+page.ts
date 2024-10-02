import {
	RedisInstanceAccessOrderField,
	type OrderDirection$options,
	type RedisInstanceAccessOrderField$options
} from '$houdini';
import type { RedisInstanceVariables } from './$houdini';
export const _RedisInstanceVariables: RedisInstanceVariables = ({ url, params }) => {
	const field = (url.searchParams.get('field') ||
		RedisInstanceAccessOrderField.WORKLOAD) as RedisInstanceAccessOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return {
		orderBy: { field: field, direction: direction },
		environment: params.env,
		team: params.team,
		name: params.redis
	};
};
