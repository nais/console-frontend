import type { JobCostVariables } from './$houdini';

export const _JobCostVariables: JobCostVariables = (event) => {
	return {
		job: event.params.job,
		team: event.params.team,
		env: event.params.env,
		to: new Date(Date.now() - 2 * 1000 * 24 * 60 * 60),
		from: new Date(Date.now() - 32 * 1000 * 24 * 60 * 60)
	};
};
