import { load_CreateOpenSearchEnvironments } from '$houdini';

export async function load(event) {
	return {
		...(await load_CreateOpenSearchEnvironments({ event, variables: { slug: event.params.team } }))
	};
}
