import { load_AdminReconcilers } from '$houdini';

export async function load(event) {
	return {
		...(await load_AdminReconcilers({
			event
		}))
	};
}
