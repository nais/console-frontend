import type { DeploymentsVariables } from './$houdini';

const rows = 25;

export const _DeploymentsVariables: DeploymentsVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(before ? { before, last: rows } : { after, first: rows })
	};
};
