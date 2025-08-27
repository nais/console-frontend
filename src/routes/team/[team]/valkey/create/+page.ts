import { load_CreateValkeyEnvironments } from '$houdini';

export async function load(event) {
	return {
		...(await load_CreateValkeyEnvironments({ event, variables: { slug: event.params.team } }))
	};
}
