import { load_AllIssues } from '$houdini';

export async function load(event) {
	return {
		...(await load_AllIssues({
			event
		}))
	};
}
