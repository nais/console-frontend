import { load_UpdateOpenSearchData } from '$houdini';

export async function load(event) {
	return {
		...(await load_UpdateOpenSearchData({
			event,
			variables: {
				environment: event.params.env,
				team: event.params.team,
				name: event.params.opensearch
			}
		}))
	};
}
