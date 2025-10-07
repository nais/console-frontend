import { load_Valkeys, OrderDirection, ValkeyOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { error } from '@sveltejs/kit';
import { startOfMonth, subMonths } from 'date-fns';
import { get } from 'svelte/store';

const rows = 25;

export async function load(event) {
	const parent = await event.parent();

	const userInfoData = get(parent.UserInfo) as {
		data?: {
			features?: {
				openSearch?: {
					enabled?: boolean;
				};
			};
		};
	};

	if (userInfoData.data?.features?.openSearch?.enabled === false) {
		error(404, 'OpenSearch not enabled');
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_Valkeys({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(ValkeyOrderField, ValkeyOrderField.ISSUES, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				from: startOfMonth(subMonths(new Date(), 12)),
				to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
			}
		}))
	};
}
