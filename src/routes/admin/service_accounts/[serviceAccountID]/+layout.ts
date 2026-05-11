import { load_AdminServiceAccountDetail } from '$houdini';

export async function load(event) {
	return {
		...(await load_AdminServiceAccountDetail({
			event,
			variables: {
				id: event.params.serviceAccountID
			}
		}))
	};
}
