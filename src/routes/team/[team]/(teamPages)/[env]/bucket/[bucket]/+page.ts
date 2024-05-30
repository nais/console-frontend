import type { BucketVariables } from './$houdini';
export const _BucketVariables: BucketVariables = ({ params }) => {
	return {
		env: params.env,
		team: params.team,
		name: params.bucket
	};
};
