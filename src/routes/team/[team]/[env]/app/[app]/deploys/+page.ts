import type { AppDeploysVariables } from './$houdini';

const rows = 25;

export const _AppDeploysVariables: AppDeploysVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(before ? { before, last: rows } : { after, first: rows })
	};
};
