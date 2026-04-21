import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { ReconcilerLogsQuery } from './reconcilerLogs';

const rows = 20;

export async function load(event) {
	const ReconcilerLogs = await runQuery(event, ReconcilerLogsQuery, {
		id: event.params.id,
		...readCursorPagination(event.url, rows)
	});

	const node = ReconcilerLogs.data?.node;
	const title = node?.__typename === 'Reconciler' ? `${node.displayName} logs` : 'Reconciler logs';
	return {
		...(await addPageMeta(event, {
			title,
			breadcrumbs: [
				{
					label: 'Reconcilers',
					href: '/admin/reconcilers'
				}
			]
		})),
		ReconcilerLogs
	};
}
