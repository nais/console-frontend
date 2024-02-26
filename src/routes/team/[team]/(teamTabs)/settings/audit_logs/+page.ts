import { error } from '@sveltejs/kit';
import type { TeamAuditLogsVariables } from './$houdini';
export const _TeamAuditLogsVariables: TeamAuditLogsVariables = ({ params, url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		throw error(400, 'Bad pagenumber');
	}
	const limit = 50;
	const offset = (page - 1) * limit;

	return { limit, offset, team: params.team };
};
