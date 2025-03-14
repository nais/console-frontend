import { load_ResourceUtilizationForApp2 } from '$houdini';
import type { PageLoad } from './$houdini';

export const ssr = false;
export const load: PageLoad = async (event) => {
	const interval = event.url.searchParams.get('interval');
	const end = new Date(Date.now());
	let start = new Date(Date.now() - 7 * 24 * 1000 * 60 * 60);
	switch (interval) {
		case '1h':
			start = new Date(Date.now() - 1000 * 60 * 60);
			break;
		case '6h':
			start = new Date(Date.now() - 6 * 1000 * 60 * 60);
			break;
		case '1d':
			start = new Date(Date.now() - 24 * 1000 * 60 * 60);
			break;
		case '30d':
			start = new Date(Date.now() - 30 * 24 * 1000 * 60 * 60);
			break;
	}

	return {
		interval,
		...(await load_ResourceUtilizationForApp2({
			event,
			variables: {
				app: event.params.app,
				env: event.params.env,
				team: event.params.team,
				start,
				end
			}
		}))
	};
};
