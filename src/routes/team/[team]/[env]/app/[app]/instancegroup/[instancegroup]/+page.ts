import { load_InstanceGroupDetail } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta.js';

export async function load(event) {
	return {
		instanceGroupName: event.params.instancegroup,
		...(await addPageMeta(event, {
			title: `${event.params.instancegroup}`
		})),
		...(await load_InstanceGroupDetail({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
}
