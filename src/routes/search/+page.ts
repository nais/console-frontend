import { load_SearchPage } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	const query = event.url.searchParams.get('q') || '';
	return {
		...(await load_SearchPage({ event, variables: { query } })),
		query
	};
};
