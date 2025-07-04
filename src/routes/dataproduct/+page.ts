import { load_DataProduct } from '$houdini';

export async function load(event) {
	return {
		...(await load_DataProduct({
			event
		}))
	};
}
