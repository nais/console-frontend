import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { InstanceGroupDetailQuery } from './instanceGroup';

export async function load(event) {
	return {
		instanceGroupName: event.params.instancegroup,
		...(await addPageMeta(event, {
			title: `Instance Group: ${event.params.instancegroup}`
		})),
		InstanceGroupDetail: await runQuery(event, InstanceGroupDetailQuery, {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app
		})
	};
}
