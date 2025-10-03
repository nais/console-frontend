import { load_TeamOverview } from '$houdini';

export async function load(event) {
	return {
		...(await load_TeamOverview({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
