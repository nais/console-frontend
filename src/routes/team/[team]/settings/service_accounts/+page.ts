import { load_TeamServiceAccounts } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Service Accounts',
			pageHeaderTitle: 'Team Settings',
			docPath: '/operate/console/api/#service-accounts',
			breadcrumbs: [
				{
					label: 'Team Settings',
					href: '/team/[team]/settings'
				}
			]
		})),

		...(await load_TeamServiceAccounts({
			event,
			variables: {
				team: event.params.team,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
