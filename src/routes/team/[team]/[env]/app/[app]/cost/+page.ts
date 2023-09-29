import type { AppCostVariables } from './$houdini';

export const _AppCostVariables: AppCostVariables = (event) => {
	return {
		app: event.params.app,
		team: event.params.team,
		env: event.params.env,
		to: new Date(Date.now() - 1 * 1000 * 24 * 60 * 60),
		from: new Date(Date.now() - 10 * 1000 * 24 * 60 * 60)
	};
};
