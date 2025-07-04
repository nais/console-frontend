import { load_UserTeams } from '$houdini';

export async function load(event) {
	return {
		...(await load_UserTeams({
			event
		}))
	};
}
