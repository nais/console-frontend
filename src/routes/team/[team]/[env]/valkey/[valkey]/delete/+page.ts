import { error } from '@sveltejs/kit';

export async function load(event) {
	const { parent, params } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	const isManagedByConsole = !params.valkey.startsWith(`valkey-${params.team}-`);
	if (!isManagedByConsole) {
		error(422, 'This Valkey instance is not managed by Console.');
	}
}
