import type { BigQueryDatasetVariables } from './$houdini';
export const _BigQueryDatasetVariables: BigQueryDatasetVariables = ({ params }) => {
	return {
		env: params.env,
		team: params.team,
		name: params.bigquerydataset
	};
};
