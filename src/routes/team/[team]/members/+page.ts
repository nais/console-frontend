import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import {
	ActivityLogActivityType,
	OrderDirection,
	TeamMemberOrderField
} from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { MembersQuery } from './members';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Members' })),
		Members: await runQuery(event, MembersQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(TeamMemberOrderField, TeamMemberOrderField.NAME, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.ASC)
			},
			filter: {
				activityTypes: [
					ActivityLogActivityType.TEAM_MEMBER_REMOVED,
					ActivityLogActivityType.TEAM_MEMBER_ADDED,
					ActivityLogActivityType.TEAM_MEMBER_SET_ROLE
				]
			},
			...readCursorPagination(event.url, rows)
		})
	};
}
