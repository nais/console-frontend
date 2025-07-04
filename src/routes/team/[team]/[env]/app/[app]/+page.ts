import { load_App } from '$houdini';
import type { PageLoad } from './$types';

const rows = 6;

export const load: PageLoad = async (event) => {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_App({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
};
