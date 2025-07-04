import { load_TeamRoles } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const roles = await load_TeamRoles({
		event,
		variables: { team: event.params.team },
		blocking: true
	});

	if (!roles) {
		error(501, 'Something went wrong when loading the page');
	}

	const current = get(roles.TeamRoles);
	if (!current) {
		error(404, 'Team not found');
	}

	if (current.errors) {
		if (current.errors) {
			if (current.errors[0].message === 'The specified team was not found.') {
				error(404, 'Team not found');
			}
		}
		error(500, 'Something went wrong when loading the page');
	}

	return {
		...(current.data
			? current.data.team
			: {
					viewerIsOwner: false,
					deletionInProgress: false,
					lastSuccessfulSync: null,
					viewerIsMember: false,
					externalResources: { gitHubTeam: null },
					purpose: '',
					slackChannel: '',
					members: { pageInfo: { totalCount: 0 } }
				}),
		teamSlug: event.params.team
	};
}
