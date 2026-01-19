import { load_CreateOpenSearchEnvironments } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const { parent } = event;

	const data = await parent();

	if (!data.userCanElevate) {
		error(403, 'You do not have access to this page');
	}

	return {
		...(await addPageMeta(event, {
			title: 'Create ',
			breadcrumbs: [
				{
					label: 'OpenSearch Instances',
					href: `/team/[team]/opensearch`
				}
			]
		})),
		...(await load_CreateOpenSearchEnvironments({ event, variables: { slug: event.params.team } }))
	};
}
