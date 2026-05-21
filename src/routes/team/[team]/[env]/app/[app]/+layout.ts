import { load_AppLayout } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta.js';

export async function load(event) {
	const appLayout = await load_AppLayout({
		event,
		variables: {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app
		}
	});

	if (event.route.id === '/team/[team]/[env]/app/[app]') {
		return {
			...appLayout,
			...(await addPageMeta(event, {
				pageHeaderTitle: event.params.app
			}))
		};
	}
	return {
		...appLayout,
		...(await addPageMeta(event, {
			pageHeaderTitle: event.params.app,
			breadcrumbs: [
				{
					label: event.params.app,
					href: '/team/[team]/[env]/app/[app]'
				}
			]
		}))
	};
}
