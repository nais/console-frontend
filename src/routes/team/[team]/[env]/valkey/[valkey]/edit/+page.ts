import { load_UpdateValkeyData } from '$houdini';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const { parent, params } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	const isManagedByConsole = !params.valkey.startsWith(`valkey-${params.team}-`);

	// FIXME: create docs and add link to docs
	if (!isManagedByConsole) {
		error(422, 'This Valkey instance is not managed by Console. See TODO to add it to Console.');
	}

	return {
		...(await load_UpdateValkeyData({
			event,
			variables: {
				environment: event.params.env,
				team: event.params.team,
				name: event.params.valkey
			}
		}))
	};
}
