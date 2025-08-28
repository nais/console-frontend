import { load_UpdateValkeyData } from '$houdini';

export async function load(event) {
	return {
		...(await load_UpdateValkeyData({
			event,
			variables: {
				environment: event.params.env,
				team: event.params.team,
				name: event.params.valkey
			}
		}))
	};
}
