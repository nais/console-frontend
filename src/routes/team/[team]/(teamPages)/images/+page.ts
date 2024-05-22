import { error } from '@sveltejs/kit';
import type { ImagesVariables } from './$houdini';
export const _ImagesVariables: ImagesVariables = ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		error(400, 'Bad pagenumber');
	}
	const limit = 18;
	const offset = (page - 1) * limit;
	const field = (url.searchParams.get('col') || 'SEVERITY_CRITICAL') as never;
	const direction = (url.searchParams.get('dir') || 'DESC') as never;

	return { limit, offset, orderBy: { field, direction } };
};
