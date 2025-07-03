import { ValkeyInstanceOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { error } from '@sveltejs/kit';
import { startOfMonth, subMonths } from 'date-fns';
import { get } from 'svelte/store';
import type { PageLoad } from './$houdini';

const rows = 25;

export const _ValkeyVariables: PageLoad = async (event) => {
	const { url } = event;
	const parent = await event.parent();

	const userInfoData = get(parent.UserInfo);

	if (userInfoData.data?.features.valkey.enabled === false) {
		error(404, 'Valkey not enabled');
	}

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		orderBy: {
			field: urlToOrderField(ValkeyInstanceOrderField, ValkeyInstanceOrderField.NAME, url),
			direction: urlToOrderDirection(url)
		},
		...(before ? { before, last: rows } : { after, first: rows }),
		from: startOfMonth(subMonths(new Date(), 12)),
		to: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
	};
};
