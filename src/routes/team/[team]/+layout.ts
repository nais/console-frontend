import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';
import { TeamRolesQuery } from './teamRoles';

export async function load(event) {
	const result = await runQuery(event, TeamRolesQuery, { team: event.params.team });

	if (result.errors) {
		if (result.errors[0].message === 'The specified team was not found.') {
			error(404, 'Team not found');
		}
		error(500, 'Something went wrong when loading the page');
	}

	if (!result.data) {
		error(404, 'Team not found');
	}

	const meta = await addPageMeta(event, {
		breadcrumbs:
			event.route.id === '/team/[team]'
				? undefined
				: [
						{
							label: event.params.team,
							href: '/team/[team]'
						}
					]
	});

	return {
		...meta,
		...result.data.team,
		teamSlug: event.params.team
	};
}
