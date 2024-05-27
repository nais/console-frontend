import { error } from '@sveltejs/kit';
import type { AnalysisTrailVariables, ImageVariables } from './$houdini';

export const _ImageVariables: ImageVariables = ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	if (!page || page < 1) {
		error(400, 'Bad pagenumber');
	}
	const limit = 10;
	const offset = (page - 1) * limit;
	const field = (url.searchParams.get('col') || 'SEVERITY') as never;
	const direction = (url.searchParams.get('dir') || 'DESC') as never;

	return { limit, offset, orderBy: { field, direction } };
};
