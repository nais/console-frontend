import { load_TeamWebhooks, load_TeamWebhooksActivity } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

const rows = 20;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const [webhooks, activity] = await Promise.all([
		load_TeamWebhooks({
			event,
			variables: {
				team: event.params.team,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}),
		load_TeamWebhooksActivity({ event, variables: { team: event.params.team } })
	]);

	return {
		...(await addPageMeta(event, {
			title: 'Webhooks',
			pageHeaderTitle: 'Team Settings',
			breadcrumbs: [{ label: 'Team Settings', href: '/team/[team]/settings' }]
		})),
		...webhooks,
		...activity
	};
}
