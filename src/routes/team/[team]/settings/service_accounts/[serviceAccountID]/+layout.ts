import { load_ServiceAccountDetail } from '$houdini';

export async function load(event) {
	return {
		...(await load_ServiceAccountDetail({
			event,
			variables: {
				id: event.params.serviceAccountID
			}
		}))
	};
}
