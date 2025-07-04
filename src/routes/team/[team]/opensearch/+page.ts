import { load_OpenSearch, OpenSearchOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { error } from '@sveltejs/kit';
import { startOfMonth, subMonths } from 'date-fns';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

const rows = 25;

export const load: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	const userInfoData = get(parent.UserInfo);

	if (userInfoData.data?.features.openSearch.enabled === false) {
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
					field: urlToOrderField(OpenSearchOrderField, OpenSearchOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				from: startOfMonth(subMonths(new Date(), 12)),
				to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
			}
		}))
	};
};
