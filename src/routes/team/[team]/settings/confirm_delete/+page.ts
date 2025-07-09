import { load_TeamDeleteKey } from '$houdini';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const key = event.url.searchParams.get('key');
	if (!key) {
		error(400, 'Missing key');
	}

	const p = await event.parent();
	if (!p.viewerIsMember) {
		error(403, 'You are not a member of this team.');
	}

	if (!p.viewerIsOwner) {
		error(403, 'You are not an owner of this team.');
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
