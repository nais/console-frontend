import {
	load_Valkey,
	ValkeyInstanceOrderField,
	type OrderDirection$options,
	type ValkeyInstanceOrder,
	type ValkeyInstanceOrderField$options
} from '$houdini';
import { error } from '@sveltejs/kit';
import type { AfterLoadEvent, PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	if (parent.UserInfo.data?.features.valkey.enabled === false) {
		error(404, 'Valkey not enabled');
	}

	const field = (url.searchParams.get('field') ||
		ValkeyInstanceOrderField.NAME) as ValkeyInstanceOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;
	const rows: number = parseInt(url.searchParams.get('rows') || '10');

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	// First day of previous month
	const from = new Date();
	from.setMonth(from.getMonth() - 1, 1); // Set to first day of previous month
	from.setHours(0, 0, 0, 0); // Reset time to start of the day

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);
	to.setHours(23, 59, 59, 999); // Set time to end of the day

	return {
		...(await load_Valkey({
			event,
			variables: {
				team: event.params.team,
				orderBy: { field: field, direction: direction } as ValkeyInstanceOrder,
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
