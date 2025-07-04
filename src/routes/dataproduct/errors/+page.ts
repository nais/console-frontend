import { load_AllErrors } from '$houdini';

export async function load(event) {
	return {
		...(await load_AllErrors({
			event
		}))
	};
}
