import { load_JobLayout } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	const jobLayout = await load_JobLayout({
		event,
		variables: {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job
		}
	});

	if (event.route.id === '/team/[team]/[env]/job/[job]') {
		return {
			...jobLayout,
			...(await addPageMeta(event, {
				pageHeaderTitle: event.params.job
			}))
		};
	}
	return {
		...jobLayout,
		...(await addPageMeta(event, {
			pageHeaderTitle: event.params.job,
			breadcrumbs: [
				{
					label: event.params.job,
					href: '/team/[team]/[env]/job/[job]'
				}
			]
		}))
	};
}
