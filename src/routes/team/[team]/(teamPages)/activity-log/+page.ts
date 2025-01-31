import { error } from '@sveltejs/kit';
import type { AfterLoadEvent } from '../jobs/$houdini';
import type { ActivityLogVariables, BeforeLoadEvent } from './$houdini';

export const _ActivityLogVariables: ActivityLogVariables = ({ url }) => {
	const rows: number = parseInt(url.searchParams.get('rows') || '10');

	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		...(before ? { before, last: rows } : { after, first: rows })
	};
};

export function _houdini_afterLoad({ data, event: { url } }: AfterLoadEvent) {
	return {
		data,
		initialRows: parseInt(url.searchParams.get('rows') || '10'),
		initialAfter: url.searchParams.get('after') || '',
		initialBefore: url.searchParams.get('before') || ''
	};
}

export async function _houdini_beforeLoad({ parent }: BeforeLoadEvent) {
	const pd = await parent();

	if (!pd.viewerIsMember) {
		error(403, 'You are not allowed to view this page');
	}
}
