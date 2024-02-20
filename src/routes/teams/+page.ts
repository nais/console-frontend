import { error } from '@sveltejs/kit';
import type { TeamsVariables } from './$houdini';
export const _TeamsVariables: TeamsVariables = ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		throw error(400, 'Bad pagenumber');
	}
	const limit = 10;
	const offset = (page - 1) * limit;

	return { limit, offset };
};
