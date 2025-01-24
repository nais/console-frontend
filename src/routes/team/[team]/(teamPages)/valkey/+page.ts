import {
	load_Valkey,
	ValkeyInstanceOrderField,
	type OrderDirection$options,
	type ValkeyInstanceOrderField$options
} from '$houdini';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	if (parent.UserInfo.data?.features.valkey.enabled === false) {
		error(404, 'Valkey not enabled');
	}

	const field = (url.searchParams.get('field') ||
		ValkeyInstanceOrderField.NAME) as ValkeyInstanceOrderField$options;
	const direction = (url.searchParams.get('direction') || 'ASC') as OrderDirection$options;

	// Date 30 days ago
	const from = new Date();
	from.setDate(from.getDate() - 30);

	// Date yesterday
	const to = new Date();
	to.setDate(to.getDate() - 1);

	return {
		...(await load_Valkey({
			event,
			variables: {
				team: event.params.team,
				orderBy: { field: field, direction: direction },
				to,
				from
			}
		}))
	};
};
