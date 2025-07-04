import { load_UserInfo } from '$houdini';

export async function load(event) {
	return {
		...event.data,
		...(await load_UserInfo({ event }))
	};
}
