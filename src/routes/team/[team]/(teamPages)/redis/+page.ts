import type { RedisVariables } from './$houdini';

import {
	RedisInstanceOrderField,
	type OrderDirection$options,
	type RedisInstanceOrderField$options
} from '$houdini';

export const _RedisVariables: RedisVariables = ({ url }) => {
	const field = (url.searchParams.get('field') ||
		RedisInstanceOrderField.NAME) as RedisInstanceOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	// Date 30 days ago
	const from = new Date();
	from.setDate(from.getDate() - 30);

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);

	return { orderBy: { field: field, direction: direction }, to, from };
};
