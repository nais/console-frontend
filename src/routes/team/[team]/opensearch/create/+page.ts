import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { CreateOpenSearchEnvironmentsQuery } from './createOpenSearch';

export async function load(event) {
	const { parent } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
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
		CreateOpenSearchEnvironments: await runQuery(event, CreateOpenSearchEnvironmentsQuery, {
			slug: event.params.team
		})
	};
}
