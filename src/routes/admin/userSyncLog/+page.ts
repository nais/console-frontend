import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { UserSyncLogsQuery } from './userSyncLog';

const rows = 20;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'User synchronization logs' })),
		UserSyncLogs: await runQuery(event, UserSyncLogsQuery, {
			...readCursorPagination(event.url, rows)
		})
	};
}
