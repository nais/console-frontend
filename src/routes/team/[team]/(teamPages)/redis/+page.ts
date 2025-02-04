import {
	load_Redis,
	RedisInstanceOrderField,
	type OrderDirection$options,
	type RedisInstanceOrder,
	type RedisInstanceOrderField$options
} from '$houdini';
import { error } from '@sveltejs/kit';
import type { AfterLoadEvent, PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	if (parent.UserInfo.data?.features.redis.enabled === false) {
		error(404, 'Redis not enabled');
	}

	const field = (url.searchParams.get('field') ||
		RedisInstanceOrderField.NAME) as RedisInstanceOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;
	const rows: number = parseInt(url.searchParams.get('rows') || '10');

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	// Date 30 days ago
	const from = new Date();
	from.setDate(from.getDate() - 30);

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);

	return {
		...(await load_Redis({
			event,
			variables: {
				team: event.params.team,
				orderBy: { field: field, direction: direction } as RedisInstanceOrder,
				...(before ? { before, last: rows } : { after, first: rows }),
				to,
				from
			}
		}))
	};
};

export function _houdini_afterLoad({ data }: AfterLoadEvent) {
	return {
		data
	};
}
