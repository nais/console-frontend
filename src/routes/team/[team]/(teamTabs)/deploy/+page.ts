import { error } from '@sveltejs/kit';
import type { TeamDeploymentsVariables } from './$houdini';
export const _TeamDeploymentsVariables: TeamDeploymentsVariables = ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		error(400, 'Bad pagenumber');
	}
	const limit = 100;
	const offset = (page - 1) * limit;

	return { limit, offset };
};
