import { OrderDirection, UserOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import type { PeopleVariables } from './$houdini';

const rows = 25;

export const _PeopleVariables: PeopleVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		orderBy: {
			field: urlToOrderField(UserOrderField, UserOrderField.NAME, url),
			direction: urlToOrderDirection(url, OrderDirection.ASC)
		},
		...(before ? { before, last: rows } : { after, first: rows })
	};
};
