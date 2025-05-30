import type { AppVariables } from './$houdini';

const rows = 6;

export const _AppVariables: AppVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(before ? { before, last: rows } : { after, first: rows })
	};
};
