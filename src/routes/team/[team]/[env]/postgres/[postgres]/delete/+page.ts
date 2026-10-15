import { load_PostgresOverview } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const parent = await event.parent();
	if (!parent.viewerIsMember && !parent.isAdmin) {
		error(403, 'You do not have permission to manage Postgres for this team.');
	}
	return {
		...(await addPageMeta(event, { title: 'Delete Postgres' })),
		...(await load_PostgresOverview({
			event,
			blocking: true,
			variables: { team: event.params.team, env: event.params.env, name: event.params.postgres }
		}))
	};
}
