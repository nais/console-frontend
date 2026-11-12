import { addPageMeta } from '#lib/utils/pageMeta.js';
import { load_PostgresLogs } from '$houdini';
import { requireMainBranch } from '#lib/domain/postgres/branchCompatibility.js';

export const ssr = false;

export async function load(event) {
	requireMainBranch(event.url);
	return {
		...(await addPageMeta(event, {
			title: 'Logs',
			pageHeaderTitle: event.params.postgres
		})),
		...(await load_PostgresLogs({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				env: event.params.env,
				name: event.params.postgres
			}
		}))
	};
}
