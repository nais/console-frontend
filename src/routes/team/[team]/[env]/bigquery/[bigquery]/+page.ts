import type { BigQueryDatasetVariables } from './$houdini';
export const _BigQueryDatasetVariables: BigQueryDatasetVariables = ({ params }) => {
	return {
		environment: params.env,
		team: params.team,
		name: params.bigquery
	};
};
