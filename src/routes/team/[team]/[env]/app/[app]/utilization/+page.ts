import { load_ResourceUtilizationForApp } from '$houdini';
import type { PageLoad } from './$houdini';

export const ssr = false;
export const load: PageLoad = async (event) => {
	const interval = event.url.searchParams.get('interval');
	const end = new Date(Date.now());
	let start = new Date(Date.now() - 7 * 24 * 1000 * 60 * 60);
	let step = 3024;
	switch (interval) {
		case '1h':
			start = new Date(Date.now() - 1000 * 60 * 60);
			step = 18;
			break;
		case '6h':
			start = new Date(Date.now() - 6 * 1000 * 60 * 60);
			step = 108;
			break;
		case '1d':
			start = new Date(Date.now() - 24 * 1000 * 60 * 60);
			step = 432;
			break;
		case '30d':
			start = new Date(Date.now() - 30 * 24 * 1000 * 60 * 60);
			step = 12960;
			break;
	}

	return {
		interval,
		...(await load_ResourceUtilizationForApp({
			event,
			variables: {
				start,
				end,
				step
			}
		}))
	};
};
