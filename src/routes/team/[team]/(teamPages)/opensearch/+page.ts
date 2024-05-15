import { error } from '@sveltejs/kit';
import type { OpenSearchVariables } from './$houdini';
export const _OpenSearchVariables: OpenSearchVariables = ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		error(400, 'Bad pagenumber');
	}
	const limit = 25;
	const offset = (page - 1) * limit;
	const field = (url.searchParams.get('col') || 'NAME') as never;
	const direction = (url.searchParams.get('dir') || 'ASC') as never;

	return { limit, offset, orderBy: { field, direction } };
};
