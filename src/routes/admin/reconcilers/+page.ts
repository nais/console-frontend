import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { AdminReconcilersQuery } from './reconcilers';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Reconcilers' })),
		AdminReconcilers: await runQuery(event, AdminReconcilersQuery, {})
	};
}
