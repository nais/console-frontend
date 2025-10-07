import { load_OpenSearch, OpenSearchOrderField, OrderDirection } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { error } from '@sveltejs/kit';
import { startOfMonth, subMonths } from 'date-fns';
import { get } from 'svelte/store';

const rows = 25;

export async function load(event) {
	const { url } = event;
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

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(await load_OpenSearch({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(OpenSearchOrderField, OpenSearchOrderField.ISSUES, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				from: startOfMonth(subMonths(new Date(), 12)),
				to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
			}
		}))
	};
}
