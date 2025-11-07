import { load_UserInfo } from '$houdini';

export async function load(event) {
	return {
		// Ensure the meta is always available to avoid undefined errors
		meta: {},
		...event.data,
		...(await load_UserInfo({ event }))
	};
}
