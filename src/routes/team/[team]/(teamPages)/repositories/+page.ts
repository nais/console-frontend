import type { RepositoriesVariables } from './$houdini';
export const _RepositoriesVariables: RepositoriesVariables = ({ url }) => {
	const filter = url.searchParams.get('filter');

	return { filter: { name: filter } };
};
