import { error } from '@sveltejs/kit';
import type { RepositoriesVariables } from './$houdini';
export const _RepositoriesVariables: RepositoriesVariables = ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		error(400, 'Bad pagenumber');
	}
	const limit = 10;
	const offset = (page - 1) * limit;

	return { limit, offset };
};
