import { load_AdminUsers } from '$houdini';

export async function load(event) {
	return {
		...(await load_AdminUsers({
			event
		}))
	};
}
