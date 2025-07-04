import { load_TeamResourceUsage } from '$houdini';

export async function load(event) {
	return {
		...(await load_TeamResourceUsage({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
