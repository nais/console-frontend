import { load_Bucket } from '$houdini';

export async function load(event) {
	return {
		...(await load_Bucket({
			event,
			variables: {
				team: event.params.team,
				environment: event.params.env,
				name: event.params.bucket
			}
		}))
	};
}
