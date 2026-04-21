import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { AdminUsersQuery } from './admin';

const rows = 20;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Users' })),
		AdminUsers: await runQuery(event, AdminUsersQuery, {
			...readCursorPagination(event.url, rows)
		})
	};
}
