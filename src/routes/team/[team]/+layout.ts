import { load_TeamRoles, type TeamRoles$result } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (
	event
): Promise<TeamRoles$result['team'] & { teamSlug: string }> => {
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
					viewerIsMember: false
				}),
		teamSlug: event.params.team
	};
};
