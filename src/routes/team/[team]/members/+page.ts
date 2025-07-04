import { load_Members, OrderDirection, TeamMemberOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import type { PageLoad } from './$types';

const rows = 25;

export const load: PageLoad = async (event) => {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	return {
		...(await load_Members({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(TeamMemberOrderField, TeamMemberOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
};
