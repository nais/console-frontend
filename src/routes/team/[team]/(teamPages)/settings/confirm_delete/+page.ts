import { error } from '@sveltejs/kit';
import type { TeamDeleteKeyVariables } from './$houdini';
export const _TeamDeleteKeyVariables: TeamDeleteKeyVariables = ({ url }) => {
	const key = url.searchParams.get('key');
	if (!key) {
		error(400, 'Missing key');
	}

	return { key };
};
