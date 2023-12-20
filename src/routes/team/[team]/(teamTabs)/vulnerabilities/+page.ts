import { error } from '@sveltejs/kit';
import type { TeamVulnerabilitiesVariables } from './$houdini';
export const _TeamVulnerabilitiesVariables: TeamVulnerabilitiesVariables = ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		throw error(400, 'Bad pagenumber');
	}
	const limit = 10;
	const offset = (page - 1) * limit;
	const field = (url.searchParams.get('col') || 'STATUS') as never;
	const direction = (url.searchParams.get('dir') || 'ASC') as never;

	return { limit, offset, orderBy: { field, direction } };
};
