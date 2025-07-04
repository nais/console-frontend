import { load_TenantUtilization } from '$houdini';

export async function load(event) {
	return {
		...(await load_TenantUtilization({
			event
		}))
	};
}
