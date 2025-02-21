import { error } from '@sveltejs/kit';
import type { ActivityLogVariables, BeforeLoadEvent } from './$houdini';

const rows = 25;
export const _ActivityLogVariables: ActivityLogVariables = ({ url }) => {
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(before ? { before, last: rows } : { after, first: rows })
	};
};

export async function _houdini_beforeLoad({ parent }: BeforeLoadEvent) {
	const pd = await parent();

	if (!pd.viewerIsMember) {
		error(403, 'You are not allowed to view this page');
	}
}
