import { error } from '@sveltejs/kit';

export async function load(event) {
	const { parent } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}
}
