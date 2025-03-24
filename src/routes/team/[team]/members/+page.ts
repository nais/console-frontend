import { OrderDirection, TeamMemberOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import type { MembersVariables } from './$houdini';

const rows = 25;

export const _MembersVariables: MembersVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		orderBy: {
			field: urlToOrderField(TeamMemberOrderField, TeamMemberOrderField.NAME, url),
			direction: urlToOrderDirection(url, OrderDirection.ASC)
		},
		...(before ? { before, last: rows } : { after, first: rows })
	};
};
