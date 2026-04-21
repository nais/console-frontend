import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { CreateValkeyEnvironmentsQuery } from './createValkey';

export async function load(event) {
	const { parent } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	return {
		...(await addPageMeta(event, {
			title: 'Create',
			breadcrumbs: [
				{
					label: 'Valkey Instances',
					href: `/team/[team]/valkey`
				}
			]
		})),
		CreateValkeyEnvironments: await runQuery(event, CreateValkeyEnvironmentsQuery, {
			slug: event.params.team
		})
	};
}
