import type { JobDeploysVariables } from './$houdini';

const rows = 25;

export const _JobDeploysVariables: JobDeploysVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(before ? { before, last: rows } : { after, first: rows })
	};
};
