import { load_TeamPostgres } from '$houdini';
import { parseLabelsParam } from '#lib/domain/labels/labels.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

const rows = 25;
const backupRows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const envParam = event.url.searchParams.get('environments')?.split(',').filter(Boolean);
	const environments = envParam?.length ? envParam : undefined;
	const labels = parseLabelsParam(event.url.searchParams.get('labels'));
	const backupAfter = event.url.searchParams.get('backupAfter') || '';
	const backupBefore = event.url.searchParams.get('backupBefore') || '';
	const { viewerIsMember } = await event.parent();

	return {
		...(await addPageMeta(event, {
			title: 'Postgres',
			pageHeaderTitle: '',
			docPath: '/persistence/postgresql'
		})),
		...(await load_TeamPostgres({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				filter: { environments, labels },
				backupFilter: { environments },
				includeBackups: viewerIsMember,
				...(backupBefore
					? { backupBefore, backupLast: backupRows }
					: { backupAfter, backupFirst: backupRows }),
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
