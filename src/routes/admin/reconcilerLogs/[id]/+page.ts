import { load_ReconcilerLogs } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { get } from 'svelte/store';

export async function load(event) {
	const data = await load_ReconcilerLogs({
		event,
		variables: {
			id: event.params.id
		},
		blocking: true
	});

	const node = get(data.ReconcilerLogs).data?.node;
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
		...data
	};
}
