import type { SqlInstanceVariables } from './$houdini';
export const _SqlInstanceVariables: SqlInstanceVariables = ({ params }) => {
	return {
		environment: params.env,
		team: params.team,
		name: params.postgres,
		from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
		to: new Date(Date.now())
	};
};
