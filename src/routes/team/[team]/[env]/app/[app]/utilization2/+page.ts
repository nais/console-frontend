import { load_ResourceUtilizationForApp2 } from '$houdini';
import type { PageLoad } from './$houdini';

function getStart(interval: string | null) {
	switch (interval) {
		case '1h':
			return new Date(Date.now() - 1000 * 60 * 60);
		case '6h':
			return new Date(Date.now() - 6 * 1000 * 60 * 60);
		case '1d':
			return new Date(Date.now() - 24 * 1000 * 60 * 60);
		case '30d':
			return new Date(Date.now() - 30 * 24 * 1000 * 60 * 60);
		default:
			return new Date(Date.now() - 7 * 24 * 1000 * 60 * 60);
	}
}

export const ssr = false;
export const load: PageLoad = async (event) => {
	const interval = event.url.searchParams.get('interval');
	const end = new Date(Date.now());
	const start = getStart(interval);

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
