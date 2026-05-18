import { load_InstanceGroupRedirect } from '$houdini';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const result = await load_InstanceGroupRedirect({
		event,
		blocking: true,
		variables: {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app
		}
	});

	const groups =
		get(result.InstanceGroupRedirect).data?.team?.environment?.application?.instanceGroups ?? [];

	if (groups.length > 0) {
		const current =
			groups.length > 1
				? groups.reduce((oldest, g) =>
						new Date(g.created) < new Date(oldest.created) ? g : oldest
					)
				: groups[0];

		redirect(
			307,
			`/team/${event.params.team}/${event.params.env}/app/${event.params.app}/instancegroup/${current.name}`
		);
	}

	redirect(307, `/team/${event.params.team}/${event.params.env}/app/${event.params.app}`);
}
