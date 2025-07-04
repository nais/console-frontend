import { load_Instances } from '$houdini';

export const ssr = false;

export async function load(event) {
	return {
		...(await load_Instances({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
}
