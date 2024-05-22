import type { RedisInstanceVariables } from './$houdini';
export const _RedisInstanceVariables: RedisInstanceVariables = ({ params }) => {
	return {
		env: params.env,
		team: params.team,
		name: params.redis
	};
};
