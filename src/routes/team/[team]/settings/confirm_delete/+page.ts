import { load_TeamDeleteKey } from '$houdini';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const key = event.url.searchParams.get('key');
	if (!key) {
		error(400, 'Missing key');
	}

	return {
		...(await load_TeamDeleteKey({
			event,
			variables: {
				team: event.params.team,
				key: key
			}
		}))
	};
}
