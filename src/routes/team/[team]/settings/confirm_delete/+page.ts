import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { TeamDeleteKeyQuery } from '../settings';

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
		...(await addPageMeta(event, { title: 'Confirm Delete' })),
		TeamDeleteKey: await runQuery(event, TeamDeleteKeyQuery, {
			team: event.params.team,
			key: key
		})
	};
}
