import type { BucketVariables } from './$houdini';
export const _BucketVariables: BucketVariables = ({ params }) => {
	return {
		environment: params.env,
		team: params.team,
		name: params.bucket
	};
};
