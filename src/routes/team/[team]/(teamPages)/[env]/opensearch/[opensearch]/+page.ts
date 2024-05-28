import type { OpenSearchInstanceVariables } from './$houdini';
export const _OpenSearchInstanceVariables: OpenSearchInstanceVariables = ({ params }) => {
	return {
		env: params.env,
		team: params.team,
		name: params.opensearch
	};
};
