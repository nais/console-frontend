import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { InstancesQuery } from './appLogs';

export const ssr = false;

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Logs'
		})),
		Instances: await runQuery(event, InstancesQuery, {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app
		})
	};
}
