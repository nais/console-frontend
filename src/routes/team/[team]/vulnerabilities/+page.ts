import { load_TeamVulnerabilities } from '$houdini';

export async function load(event) {
	return {
		...(await load_TeamVulnerabilities({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
