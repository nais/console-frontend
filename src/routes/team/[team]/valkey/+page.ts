import { load_Valkey, ValkeyInstanceOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { error } from '@sveltejs/kit';
import { startOfMonth, subMonths } from 'date-fns';
import { get } from 'svelte/store';

const rows = 25;

export async function load(event) {
	const parent = await event.parent();
	const userInfoData = get(parent.UserInfo);

	if (userInfoData.data?.features.valkey.enabled === false) {
		error(404, 'Valkey not enabled');
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_Valkey({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(
						ValkeyInstanceOrderField,
						ValkeyInstanceOrderField.NAME,
						event.url
					),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				from: startOfMonth(subMonths(new Date(), 12)),
				to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
			}
		}))
	};
}
