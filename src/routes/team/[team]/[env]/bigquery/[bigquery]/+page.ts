import { load_BigQueryDataset } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_BigQueryDataset({
			event,
			variables: {
				team: event.params.team,
				environment: event.params.env,
				name: event.params.bigquery
			}
		}))
	};
};
