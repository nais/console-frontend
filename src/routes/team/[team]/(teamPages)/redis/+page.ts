import type { RedisVariables } from './$houdini';

import type { OrderDirection$options, RedisInstanceOrderField$options } from '$houdini';

export const _RedisVariables: RedisVariables = ({ url }) => {
	const field = (url.searchParams.get('field') || 'NAME') as RedisInstanceOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	return { orderBy: { field: field, direction: direction } };
};
