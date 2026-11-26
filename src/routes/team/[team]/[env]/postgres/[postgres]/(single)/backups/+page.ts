import { load_PostgresBackups } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';

const rows = 25;

export async function load(event) {
	const { viewerIsMember } = await event.parent();
	if (!viewerIsMember) {
		error(403, 'Only team members can view Postgres backups.');
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Backups' })),
		...(await load_PostgresBackups({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				env: event.params.env,
				name: event.params.postgres,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
