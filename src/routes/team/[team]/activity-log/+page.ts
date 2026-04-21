import { ActivityLogActivityType } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { ActivityLogQuery } from './activityLog';

const rows = 20;

const allActivityTypes = new Set<string>(Object.values(ActivityLogActivityType));

function parseActivityTypes(raw: string | null): ActivityLogActivityType[] | undefined {
	if (!raw) return undefined;
	const parsed = raw
		.split(',')
		.map((s) => s.trim())
		.filter(
			(s): s is string => s.length > 0 && allActivityTypes.has(s)
		) as ActivityLogActivityType[];
	return parsed.length > 0 ? parsed : undefined;
}

export async function load(event) {
	const activityTypes = parseActivityTypes(event.url.searchParams.get('activityTypes'));

	return {
		...(await addPageMeta(event, { title: 'Activity Log' })),
		ActivityLog: await runQuery(event, ActivityLogQuery, {
			team: event.params.team,
			filter: activityTypes ? { activityTypes } : undefined,
			...readCursorPagination(event.url, rows)
		})
	};
}
