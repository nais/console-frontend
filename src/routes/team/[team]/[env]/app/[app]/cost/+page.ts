import { load_AppCost } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const from = event.url.searchParams.get('from');
	const to = event.url.searchParams.get('to');

	const fromDate = from ? new Date(from) : new Date(Date.now() - 32 * 1000 * 24 * 60 * 60);
	const toDate = to ? new Date(to) : new Date(Date.now() - 2 * 1000 * 24 * 60 * 60);

	return {
		fromDate,
		toDate,
		...(await load_AppCost({
			event,
			variables: {
				app: event.params.app,
				team: event.params.team,
				env: event.params.env,
				to: toDate,
				from: fromDate
			}
		}))
	};
};
